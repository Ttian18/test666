import express, { Request, Response, NextFunction } from "express";
import OpenAI from "openai";
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import { findMerchantCategory } from "schema";
import {
  uploadExtended,
  normalizeImageForOpenAI,
} from "../../utils/upload/uploadUtils.ts";
import { validateFile } from "../../utils/validation/validationUtils.ts";
import fs from "fs";
import path from "path";

const router = express.Router();
const prisma = new PrismaClient();
const databaseUrl = process.env.DATABASE_URL;

// Validate required environment variables
if (!process.env.OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY is not set in environment variables");
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set in environment variables");
  process.exit(1);
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Interface for parsed receipt data
interface ParsedReceiptData {
  date: string;
  time?: string;
  merchant: string;
  merchant_address?: string;
  merchant_phone?: string;
  merchant_category: string;
  transaction_category: string;
  items?: Array<{
    name: string;
    quantity: number;
    unit_price: number;
    line_total: number;
    item_category?: string;
  }>;
  subtotal?: number;
  tax_amount?: number;
  total_amount: number;
  currency?: string;
  payment_method?: string;
  receipt_number?: string;
  notes?: string;
  [key: string]: any; // Index signature for Prisma JSON compatibility
}

// Parse receipt with OpenAI Vision API
async function parseReceiptWithOpenAI(
  imageBuffer: Buffer,
  mimeType: string
): Promise<ParsedReceiptData> {
  const base64 = imageBuffer.toString("base64");
  const dataUrl = `data:${mimeType};base64,${base64}`;

  const systemPrompt = `You are a receipt parsing expert. Extract key information from receipt images and return structured JSON data.`;

  const userPrompt = `Parse this receipt image and extract the following information in JSON format:
  {
    "date": "YYYY-MM-DD",
    "time": "HH:MM",
    "merchant": "store/restaurant name",
    "merchant_address": "full address",
    "merchant_phone": "phone number",
    "merchant_category": "business category - Food & Dining, Transportation, Shopping, Entertainment, Healthcare, Education, Travel, Housing, Utilities, Subscriptions, or Other",
    "transaction_category": "transaction category - same as merchant_category",
    "items": [
      {
        "name": "item name",
        "quantity": number,
        "unit_price": number,
        "line_total": number,
        "item_category": "category"
      }
    ],
    "subtotal": number,
    "tax_amount": number,
    "total_amount": number,
    "currency": "USD",
    "payment_method": "payment type",
    "receipt_number": "receipt number",
    "notes": "any additional notes"
  }

  Important:
  - Return only valid JSON
  - Ensure all monetary values are numbers (not strings)
  - If information is not available, use null or empty string
  - For merchant_category: restaurants, cafes, food trucks, noodle shops, pizza places, bars, pubs, fast food = "Food & Dining"
  - For merchant_category: gas stations, parking, uber, lyft, taxi, airlines, car rental, public transit = "Transportation"  
  - For merchant_category: retail stores, malls, online shopping, grocery stores, supermarkets, department stores, clothing stores = "Shopping"
  - For merchant_category: movies, theaters, concerts, streaming services, games, amusement parks = "Entertainment"
  - For merchant_category: hospitals, clinics, doctors, dentists, medical labs, pharmacies, yoga studios, fitness centers, wellness centers, spas, massage therapy = "Healthcare"
  - For merchant_category: schools, universities, colleges, training courses, online learning = "Education"
  - For merchant_category: hotels, motels, resorts, lodges, Marriott, Hilton, Hyatt, Airbnb, travel agencies, flights = "Travel"
  - For merchant_category: rent, mortgage, property management, landlord, housing, apartment, condo fees, HOA = "Housing"
  - For merchant_category: electric, water, gas, basic internet, phone, cable, insurance companies = "Utilities"
  - For merchant_category: Netflix, Spotify, Apple Music, Amazon Prime, Disney+, streaming services, software subscriptions, app subscriptions, monthly memberships = "Subscriptions"
  - Use "Other" only if the business doesn't clearly fit any of the above categories`;

  console.log("🤖 Calling OpenAI Vision API with model: gpt-4o-mini");
  console.log("📊 Image data URL length:", dataUrl.length);

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: [
          { type: "text", text: userPrompt },
          { type: "image_url", image_url: { url: dataUrl } },
        ],
      },
    ],
    temperature: 0.1,
    response_format: { type: "json_object" },
  });

  console.log("✅ OpenAI API call completed successfully");

  const text = response.choices?.[0]?.message?.content?.trim();
  console.log("📝 OpenAI raw response:", text);

  if (!text) {
    throw new Error("Empty response from OpenAI");
  }

  let parsed;
  try {
    parsed = JSON.parse(text);
    console.log("✅ Successfully parsed OpenAI JSON response");
  } catch (e) {
    console.error("❌ Failed to parse OpenAI response as JSON:", text);
    throw new Error("Failed to parse OpenAI response as JSON");
  }

  // Use OpenAI's categorization directly, with fallback to manual mapping if needed
  const merchantCategory =
    parsed.merchant_category ||
    findMerchantCategory(parsed.merchant) ||
    "Other";
  const transactionCategory =
    parsed.transaction_category ||
    findMerchantCategory(parsed.merchant) ||
    "Other";

  return {
    ...parsed,
    merchant_category: merchantCategory,
    transaction_category: transactionCategory,
  };
}

// Interface for authenticated request with single file
interface AuthenticatedRequestSingle extends Request {
  file?: Express.Multer.File;
  body: {
    user_id?: string;
    parsed_data?: ParsedReceiptData;
  };
}

// Interface for authenticated request with multiple files
interface AuthenticatedRequestMultiple extends Request {
  files?:
    | Express.Multer.File[]
    | { [fieldname: string]: Express.Multer.File[] };
  body: {
    user_id?: string;
    parsed_data?: ParsedReceiptData;
  };
}

// Error handling middleware for multer
const handleUploadError = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: "File too large",
        message: "Maximum file size is 10MB",
      });
    }
    return res.status(400).json({
      error: "Upload error",
      message: error.message,
    });
  } else if (error) {
    // Handle file filter errors
    return res.status(400).json({
      error: "File validation failed",
      message: error.message,
    });
  }
  next();
};

// POST /upload - Upload and parse receipt
router.post(
  "/upload",
  uploadExtended.single("receipt"),
  handleUploadError,
  async (req: AuthenticatedRequestSingle, res: Response) => {
    try {
      // Validate database connection
      if (!databaseUrl) {
        console.error("DATABASE_URL not found in environment variables");
        return res.status(500).json({ error: "Database configuration error" });
      }

      // Check if file was uploaded successfully
      if (!req.file) {
        return res.status(400).json({
          error: "No file uploaded or file validation failed",
          message:
            "Please ensure you're uploading a valid image file (JPG, PNG, HEIC, etc.)",
        });
      }

      console.log("📁 File received:", {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      });

      validateFile(req.file, "receipt");

      // Check if user is authenticated (you can add JWT middleware here)
      // For now, we'll assume user_id is passed in the request
      const userId = parseInt(req.body.user_id || "1") || 1; // Convert to integer and default to 1

      // Validate user exists in database
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Parse receipt with OpenAI Vision API
      let parsedData;
      try {
        console.log(
          "Starting receipt parsing for file:",
          req.file.originalname
        );

        // Normalize to a model-friendly buffer + mimetype
        const { buffer: normBuf, mimeType } = await normalizeImageForOpenAI(
          req.file
        );
        console.log(
          "Normalized image - MIME type:",
          mimeType,
          "Buffer size:",
          normBuf.length
        );

        // Now parse with your existing function (which already uses mimeType)
        parsedData = await parseReceiptWithOpenAI(normBuf, mimeType);
        console.log("OpenAI parsing completed successfully");
      } catch (parseError) {
        console.error("OpenAI parsing error:", parseError);

        // Check if it's a HEIC file for better error messaging
        const isHeicFile =
          req.file?.originalname?.toLowerCase().endsWith(".heic") ||
          req.file?.originalname?.toLowerCase().endsWith(".heif") ||
          req.file?.mimetype?.includes("heic") ||
          req.file?.mimetype?.includes("heif");

        if (isHeicFile) {
          return res.status(422).json({
            error:
              "HEIC file processing failed. The image may be too blurry, corrupted, or not contain readable receipt text. Please try a clearer image or convert to JPG.",
          });
        }

        return res.status(422).json({
          error: "File parsing failed: blurry image or missing key fields.",
        });
      }

      // Log parsed data for debugging
      console.log(
        "Parsed data from OpenAI:",
        JSON.stringify(parsedData, null, 2)
      );

      // Validate parsed data
      if (!parsedData.merchant || !parsedData.total_amount) {
        console.log("Validation failed - missing required fields:");
        console.log("- merchant:", parsedData.merchant);
        console.log("- total_amount:", parsedData.total_amount);
        return res.status(422).json({
          error: "Failed to extract required information from receipt",
        });
      }

      // Store image (in production, you'd upload to cloud storage)
      const filename = `${Date.now()}_${req.file.originalname}`;
      const imagePath = `uploads/${filename}`;
      const fullImagePath = path.join(uploadsDir, filename);

      // Check for duplicate transactions BEFORE creating anything
      console.log("🚨 DUPLICATE DETECTION STARTING...");
      let existingTransaction = null;
      try {
        console.log("🔍 Checking for duplicates:", {
          userId,
          merchant: parsedData.merchant,
          amount: parsedData.total_amount,
        });

        // Check for exact matches: same user, merchant, and amount (regardless of date)
        // Use a range for amount to handle floating-point precision issues
        const amountTolerance = 0.01; // Allow 1 cent difference
        const duplicateQuery = {
          where: {
            user_id: userId,
            merchant: parsedData.merchant,
            amount: {
              gte: parsedData.total_amount - amountTolerance,
              lte: parsedData.total_amount + amountTolerance,
            },
          },
        };
        console.log(
          "🔍 Duplicate query:",
          JSON.stringify(duplicateQuery, null, 2)
        );

        existingTransaction = await prisma.transaction.findFirst(
          duplicateQuery
        );
        console.log(
          "🔍 Query result:",
          existingTransaction ? "FOUND" : "NOT FOUND"
        );

        if (existingTransaction) {
          console.log("✅ Duplicate transaction found:", {
            existingId: existingTransaction.id,
            merchant: existingTransaction.merchant,
            amount: existingTransaction.amount,
            date: existingTransaction.date,
            newDate: parsedData.date,
          });
        } else {
          console.log(
            "❌ No duplicate found - proceeding with new transaction"
          );
        }
      } catch (findError) {
        console.log("🚨 ERROR in duplicate detection:", findError);
        if (findError instanceof Error) {
          console.log("🚨 Error stack:", findError.stack);
        }
      }
      console.log("🚨 DUPLICATE DETECTION COMPLETED");

      if (existingTransaction) {
        console.log("Duplicate transaction found, skipping creation:", {
          existingId: existingTransaction.id,
          merchant: existingTransaction.merchant,
          amount: existingTransaction.amount,
          date: existingTransaction.date,
        });

        // Return existing transaction instead of creating a new one
        return res.status(200).json({
          message: "Receipt already processed - duplicate transaction found",
          voucher: null, // No voucher created for duplicates
          transaction: existingTransaction,
          isDuplicate: true,
        });
      }

      // Save the file to disk (only if no duplicate found)
      fs.writeFileSync(fullImagePath, req.file.buffer);

      // Store voucher in database (only if no duplicate found)
      let voucher;
      try {
        voucher = await prisma.voucher.create({
          data: {
            user_id: userId,
            image_path: imagePath,
            parsed_data: parsedData,
            timestamp: new Date(),
          },
        });
        console.log("🚨 VOUCHER CREATED WITH ID:", voucher.id);
      } catch (dbError) {
        console.error("Database error creating voucher:", dbError);
        // Clean up saved image file if voucher creation fails
        try {
          if (fs.existsSync(fullImagePath)) {
            fs.unlinkSync(fullImagePath);
          }
        } catch (cleanupError) {
          console.error("Failed to cleanup image file:", cleanupError);
        }
        return res
          .status(500)
          .json({ error: "Failed to save voucher to database" });
      }

      // Create transaction from parsed data
      let transaction;
      try {
        // Use enhanced category mapping based on merchant
        console.log("=== BACKEND CATEGORY MAPPING DEBUG ===");
        console.log("Raw merchant from parsedData:", parsedData.merchant);
        console.log(
          "Calling findMerchantCategory with:",
          JSON.stringify(parsedData.merchant)
        );

        const mappedCategory = findMerchantCategory(parsedData.merchant);
        console.log("findMerchantCategory returned:", mappedCategory);
        console.log(
          "parsedData.transaction_category:",
          parsedData.transaction_category
        );

        // Enhanced categorization with robust fallback algorithm
        let enhancedCategory = "Other"; // Default fallback

        // Step 1: Try OpenAI's categorization first
        if (
          parsedData.transaction_category &&
          parsedData.transaction_category !== "Other"
        ) {
          enhancedCategory = parsedData.transaction_category;
        }
        // Step 2: Try manual mapping if OpenAI failed or returned "Other"
        else if (mappedCategory && mappedCategory !== "Other") {
          enhancedCategory = mappedCategory;
        }
        // Step 3: Validate the category exists in our schema
        const validCategories = [
          "Food & Dining",
          "Transportation",
          "Shopping",
          "Entertainment",
          "Healthcare",
          "Education",
          "Travel",
          "Housing",
          "Utilities",
          "Subscriptions",
          "Other",
        ];
        if (!validCategories.includes(enhancedCategory)) {
          console.log(
            `Invalid category "${enhancedCategory}", falling back to "Other"`
          );
          enhancedCategory = "Other";
        }

        console.log("Final enhancedCategory:", enhancedCategory);
        console.log("==========================================");

        // Note: food_subcategory field is not available in current schema

        // Handle date properly - use upload time if receipt date is invalid
        let transactionDate;
        try {
          // Try to parse the receipt date
          const receiptDate = new Date(parsedData.date);
          // Check if the date is valid (not NaN and not epoch)
          if (
            isNaN(receiptDate.getTime()) ||
            receiptDate.getFullYear() < 1980
          ) {
            throw new Error("Invalid date");
          }
          transactionDate = receiptDate;
        } catch (dateError) {
          console.log(
            `Invalid receipt date "${parsedData.date}", using upload timestamp`
          );
          transactionDate = new Date(); // Use current upload time
        }

        transaction = await prisma.transaction.create({
          data: {
            user_id: userId,
            date: transactionDate,
            amount: parsedData.total_amount,
            category: enhancedCategory,
            merchant: parsedData.merchant,
            source: "voucher",
            receipt_img: imagePath,
            merchant_category: parsedData.merchant_category || enhancedCategory,
          },
        });
      } catch (dbError) {
        console.error("Database error creating transaction:", dbError);
        return res
          .status(500)
          .json({ error: "Failed to create transaction from voucher" });
      }

      res.status(201).json({
        message: "Receipt uploaded and parsed successfully",
        voucher: {
          id: voucher.id,
          user_id: voucher.user_id,
          image_path: voucher.image_path,
          parsed_data: voucher.parsed_data,
          timestamp: voucher.timestamp,
        },
        transaction: {
          id: transaction.id,
          user_id: transaction.user_id,
          date: transaction.date,
          amount: transaction.amount,
          category: transaction.category,
          merchant: transaction.merchant,
          source: transaction.source,
          receipt_img: transaction.receipt_img,
          merchant_category: transaction.merchant_category,
        },
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// POST /voucher/bulk-upload - Upload multiple receipts
router.post(
  "/bulk-upload",
  uploadExtended.array("receipts", 10),
  async (req: AuthenticatedRequestMultiple, res: Response) => {
    try {
      const userId = parseInt(req.body.user_id as string) || 1;
      const files = Array.isArray(req.files) ? req.files : [];

      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      const results = [];
      const errors = [];

      for (const file of files) {
        try {
          // Validate file
          const validationError = validateFile(file, "receipt");
          if (validationError) {
            errors.push({
              filename: file.originalname,
              error: validationError,
            });
            continue;
          }

          // Normalize image for OpenAI
          const { buffer: normalizedBuffer, mimeType } =
            await normalizeImageForOpenAI(file);

          // Parse receipt with OpenAI
          const parsedData = await parseReceiptWithOpenAI(
            normalizedBuffer,
            mimeType
          );

          // Save image file
          const timestamp = Date.now();
          const filename = `${timestamp}_${file.originalname}`;
          const imagePath = path.join("uploads", filename);
          fs.writeFileSync(path.join(process.cwd(), imagePath), file.buffer);

          // Check for duplicates
          const existingTransaction = await prisma.transaction.findFirst({
            where: {
              user_id: userId,
              merchant: parsedData.merchant,
              amount: {
                gte: parsedData.total_amount - 0.01,
                lte: parsedData.total_amount + 0.01,
              },
            },
          });

          if (existingTransaction) {
            results.push({
              filename: file.originalname,
              success: false,
              error: "Duplicate transaction found",
              isDuplicate: true,
            });
            continue;
          }

          // Create voucher
          const voucher = await prisma.voucher.create({
            data: {
              user_id: userId,
              image_path: imagePath,
              parsed_data: parsedData,
              timestamp: new Date(),
            },
          });

          // Create transaction from voucher with robust categorization
          const mappedCategory = findMerchantCategory(parsedData.merchant);
          let enhancedCategory = "Other"; // Default fallback

          // Step 1: Try OpenAI's categorization first
          if (
            parsedData.transaction_category &&
            parsedData.transaction_category !== "Other"
          ) {
            enhancedCategory = parsedData.transaction_category;
          }
          // Step 2: Try manual mapping if OpenAI failed or returned "Other"
          else if (mappedCategory && mappedCategory !== "Other") {
            enhancedCategory = mappedCategory;
          }
          // Step 3: Validate the category exists in our schema
          const validCategories = [
            "Food & Dining",
            "Transportation",
            "Shopping",
            "Entertainment",
            "Healthcare",
            "Education",
            "Travel",
            "Housing",
            "Utilities",
            "Subscriptions",
            "Other",
          ];
          if (!validCategories.includes(enhancedCategory)) {
            enhancedCategory = "Other";
          }

          let transactionDate;
          try {
            const receiptDate = new Date(parsedData.date);
            if (
              isNaN(receiptDate.getTime()) ||
              receiptDate.getFullYear() < 1980
            ) {
              throw new Error("Invalid date");
            }
            transactionDate = receiptDate;
          } catch (dateError) {
            transactionDate = new Date();
          }

          const transaction = await prisma.transaction.create({
            data: {
              user_id: userId,
              date: transactionDate,
              amount: parsedData.total_amount,
              category: enhancedCategory,
              merchant: parsedData.merchant,
              source: "voucher",
              receipt_img: imagePath,
              merchant_category:
                parsedData.merchant_category || enhancedCategory,
            },
          });

          results.push({
            filename: file.originalname,
            voucher_id: voucher.id,
            transaction_id: transaction.id,
            success: true,
            parsed_data: parsedData,
          });
        } catch (error) {
          console.error(`Error processing ${file.originalname}:`, error);
          errors.push({
            filename: file.originalname,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      const response = {
        message: `Processed ${files.length} files`,
        results,
        errors,
      };

      // Return 207 Multi-Status if there are errors, 200 if all successful
      const statusCode = errors.length > 0 ? 207 : 200;
      res.status(statusCode).json(response);
    } catch (error) {
      console.error("Bulk upload error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// GET /vouchers - Get all vouchers for a user
router.get("/", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.query.user_id as string) || 1;

    const vouchers = await prisma.voucher.findMany({
      where: { user_id: userId },
      orderBy: { timestamp: "desc" },
    });

    res.json({ vouchers });
  } catch (error) {
    console.error("Error fetching vouchers:", error);
    res.status(500).json({ error: "Failed to fetch vouchers" });
  }
});

// GET /voucher/:id - Get specific voucher
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const voucherId = parseInt(req.params.id);
    const userId = parseInt(req.query.user_id as string) || 1;

    const voucher = await prisma.voucher.findFirst({
      where: {
        id: voucherId,
        user_id: userId,
      },
    });

    if (!voucher) {
      return res.status(404).json({ error: "Voucher not found" });
    }

    res.json({ voucher });
  } catch (error) {
    console.error("Error fetching voucher:", error);
    res.status(500).json({ error: "Failed to fetch voucher" });
  }
});

// PUT /voucher/:id - Update voucher
router.put("/:id", async (req: AuthenticatedRequestSingle, res: Response) => {
  try {
    const voucherId = parseInt(req.params.id);
    const userId = parseInt(req.body.user_id as string) || 1;
    const { parsed_data } = req.body;

    if (!parsed_data) {
      return res.status(400).json({ error: "parsed_data is required" });
    }

    const voucher = await prisma.voucher.findFirst({
      where: {
        id: voucherId,
        user_id: userId,
      },
    });

    if (!voucher) {
      return res.status(404).json({ error: "Voucher not found" });
    }

    // Update voucher
    const updatedVoucher = await prisma.voucher.update({
      where: { id: voucherId },
      data: {
        parsed_data: parsed_data,
      },
    });

    // Update corresponding transaction
    const updatedTransaction = await prisma.transaction.updateMany({
      where: {
        user_id: userId,
        receipt_img: voucher.image_path,
      },
      data: {
        amount: (parsed_data as ParsedReceiptData).total_amount,
        category:
          (parsed_data as ParsedReceiptData).transaction_category || "Others",
        merchant: (parsed_data as ParsedReceiptData).merchant,
        merchant_category:
          (parsed_data as ParsedReceiptData).merchant_category || "Others",
      },
    });

    res.json({
      message: "Voucher updated successfully",
      voucher: updatedVoucher,
      transactions_updated: updatedTransaction.count,
    });
  } catch (error) {
    console.error("Error updating voucher:", error);
    res.status(500).json({ error: "Failed to update voucher" });
  }
});

// POST /voucher/:id/confirm - Confirm voucher and create transaction
router.post(
  "/:id/confirm",
  async (req: AuthenticatedRequestSingle, res: Response) => {
    try {
      const voucherId = parseInt(req.params.id);
      const userId = parseInt(req.body.user_id as string) || 1;

      const voucher = await prisma.voucher.findFirst({
        where: {
          id: voucherId,
          user_id: userId,
        },
      });

      if (!voucher) {
        return res.status(404).json({ error: "Voucher not found" });
      }

      // Check if transaction already exists
      const existingTransaction = await prisma.transaction.findFirst({
        where: {
          user_id: userId,
          receipt_img: voucher.image_path,
        },
      });

      if (existingTransaction) {
        return res.status(400).json({
          error: "Transaction already exists for this voucher",
          transaction: existingTransaction,
        });
      }

      // Create transaction from voucher
      const parsedData = voucher.parsed_data as unknown as ParsedReceiptData;
      const transaction = await prisma.transaction.create({
        data: {
          user_id: userId,
          date: new Date(parsedData.date) || new Date(),
          amount: parsedData.total_amount,
          category: parsedData.transaction_category || "Others",
          merchant: parsedData.merchant,
          source: "voucher",
          receipt_img: voucher.image_path,
          merchant_category: parsedData.merchant_category || "Others",
        },
      });

      res.status(201).json({
        message: "Transaction created successfully",
        transaction: transaction,
      });
    } catch (error) {
      console.error("Error confirming voucher:", error);
      res.status(500).json({ error: "Failed to confirm voucher" });
    }
  }
);

// POST /test-ai - Test OpenAI API connection
router.post("/test-ai", async (req: Request, res: Response) => {
  try {
    console.log("🧪 Testing OpenAI API connection...");

    const testResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Say 'Hello, OpenAI API is working!'" },
      ],
      temperature: 0.1,
    });

    const content = testResponse.choices?.[0]?.message?.content;
    console.log("✅ OpenAI API test successful:", content);

    res.json({
      success: true,
      message: "OpenAI API is working",
      response: content,
      model: "gpt-4o-mini",
    });
  } catch (error) {
    console.error("❌ OpenAI API test failed:", error);
    res.status(500).json({
      success: false,
      error: "OpenAI API test failed",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// DELETE /voucher/:id - Delete voucher
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const voucherId = parseInt(req.params.id);
    const userId = parseInt(req.query.user_id as string) || 1;

    const voucher = await prisma.voucher.findFirst({
      where: {
        id: voucherId,
        user_id: userId,
      },
    });

    if (!voucher) {
      return res.status(404).json({ error: "Voucher not found" });
    }

    // Delete associated transaction
    await prisma.transaction.deleteMany({
      where: {
        user_id: userId,
        receipt_img: voucher.image_path,
      },
    });

    // Delete voucher
    await prisma.voucher.delete({
      where: { id: voucherId },
    });

    // Delete image file
    try {
      const imagePath = path.join(process.cwd(), voucher.image_path);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    } catch (fileError) {
      console.error("Error deleting image file:", fileError);
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting voucher:", error);
    res.status(500).json({ error: "Failed to delete voucher" });
  }
});

export default router;
