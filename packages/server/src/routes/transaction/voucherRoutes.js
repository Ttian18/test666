import express from "express";
import OpenAI from "openai";
import { PrismaClient } from "@prisma/client";
import { findMerchantCategory, getAllCategories } from "common";

// SECURITY WARNING: This file contains critical security vulnerabilities
// Some routes use req.query.user_id allowing access to any user's data
// TODO: Apply authentication middleware in Phase 3
import {
  uploadExtended,
  normalizeImageForOpenAI,
} from "../../utils/upload/uploadUtils.js";
import { validateFile } from "../../utils/validation/validationUtils.js";
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

// Parse receipt with OpenAI Vision API
async function parseReceiptWithOpenAI(imageBuffer, mimeType) {
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
  - Use "Others" for unknown categories
  - Ensure all monetary values are numbers (not strings)
  - If information is not available, use null or empty string
  - Categorize items using the merchant category mapping`;

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

  const text = response.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new Error("Empty response from OpenAI");
  }

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    throw new Error("Failed to parse OpenAI response as JSON");
  }

  // Apply merchant category mapping
  const merchantCategory = findMerchantCategory(parsed.merchant);
  const transactionCategory = findMerchantCategory(parsed.merchant);

  return {
    ...parsed,
    merchant_category: merchantCategory,
    transaction_category: transactionCategory,
  };
}

// POST /upload - Upload and parse receipt
router.post("/upload", uploadExtended.single("receipt"), async (req, res) => {
  try {
    // Validate database connection
    if (!databaseUrl) {
      console.error("DATABASE_URL not found in environment variables");
      return res.status(500).json({ error: "Database configuration error" });
    }

    validateFile(req.file, "receipt");

    // Check if user is authenticated (you can add JWT middleware here)
    // For now, we'll assume user_id is passed in the request
    const userId = parseInt(req.body.user_id) || 1; // Convert to integer and default to 1

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
      // Normalize to a model-friendly buffer + mimetype
      const { buffer: normBuf, mimeType } = await normalizeImageForOpenAI(
        req.file
      );

      // Now parse with your existing function (which already uses mimeType)
      parsedData = await parseReceiptWithOpenAI(normBuf, mimeType);
    } catch (parseError) {
      console.error("OpenAI parsing error:", parseError);
      return res.status(422).json({
        error: "File parsing failed: blurry image or missing key fields.",
      });
    }

    // Validate parsed data
    if (!parsedData.merchant || !parsedData.total_amount) {
      return res.status(422).json({
        error: "Failed to extract required information from receipt",
      });
    }

    // Store image (in production, you'd upload to cloud storage)
    const filename = `${Date.now()}_${req.file.originalname}`;
    const imagePath = `uploads/${filename}`;
    const fullImagePath = path.join(uploadsDir, filename);

    // Save the file to disk
    fs.writeFileSync(fullImagePath, req.file.buffer);

    // Store voucher in database
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
      transaction = await prisma.transaction.create({
        data: {
          user_id: userId,
          date: new Date(parsedData.date) || new Date(),
          amount: parsedData.total_amount,
          category: parsedData.transaction_category || "Others",
          merchant: parsedData.merchant,
          source: "voucher",
          receipt_img: imagePath,
          merchant_category: parsedData.merchant_category || "Others",
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
});

// POST /voucher/bulk-upload - Upload multiple receipts
router.post(
  "/bulk-upload",
  uploadExtended.array("receipts", 10),
  async (req, res) => {
    try {
      const userId = parseInt(req.body.user_id) || 1;
      const files = req.files;

      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      const results = [];
      const errors = [];

      for (const file of files) {
        try {
          // Validate file
          const validationError = validateFile(file);
          if (validationError) {
            errors.push({
              filename: file.originalname,
              error: validationError,
            });
            continue;
          }

          // Normalize image for OpenAI
          const normalizedBuffer = await normalizeImageForOpenAI(
            file.buffer,
            file.mimetype
          );

          // Parse receipt with OpenAI
          const parsedData = await parseReceiptWithOpenAI(
            normalizedBuffer,
            file.mimetype
          );

          // Save image file
          const timestamp = Date.now();
          const filename = `${timestamp}_${file.originalname}`;
          const imagePath = path.join("uploads", filename);
          fs.writeFileSync(path.join(process.cwd(), imagePath), file.buffer);

          // Create voucher
          const voucher = await prisma.voucher.create({
            data: {
              user_id: userId,
              image_path: imagePath,
              parsed_data: parsedData,
              timestamp: new Date(),
            },
          });

          results.push({
            filename: file.originalname,
            voucher_id: voucher.id,
            success: true,
            parsed_data: parsedData,
          });
        } catch (error) {
          console.error(`Error processing ${file.originalname}:`, error);
          errors.push({
            filename: file.originalname,
            error: error.message,
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
router.get("/", async (req, res) => {
  try {
    const userId = parseInt(req.query.user_id) || 1;

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
router.get("/:id", async (req, res) => {
  try {
    const voucherId = parseInt(req.params.id);
    const userId = parseInt(req.query.user_id) || 1;

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
router.put("/:id", async (req, res) => {
  try {
    const voucherId = parseInt(req.params.id);
    const userId = parseInt(req.body.user_id) || 1;
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
        amount: parsed_data.total_amount,
        category: parsed_data.transaction_category || "Others",
        merchant: parsed_data.merchant,
        merchant_category: parsed_data.merchant_category || "Others",
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
router.post("/:id/confirm", async (req, res) => {
  try {
    const voucherId = parseInt(req.params.id);
    const userId = parseInt(req.body.user_id) || 1;

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
    const transaction = await prisma.transaction.create({
      data: {
        user_id: userId,
        date: new Date(voucher.parsed_data.date) || new Date(),
        amount: voucher.parsed_data.total_amount,
        category: voucher.parsed_data.transaction_category || "Others",
        merchant: voucher.parsed_data.merchant,
        source: "voucher",
        receipt_img: voucher.image_path,
        merchant_category: voucher.parsed_data.merchant_category || "Others",
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
});

// DELETE /voucher/:id - Delete voucher
router.delete("/:id", async (req, res) => {
  try {
    const voucherId = parseInt(req.params.id);
    const userId = parseInt(req.query.user_id) || 1;

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
