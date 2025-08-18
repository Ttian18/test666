import express from "express";
import multer from "multer";
import OpenAI from "openai";
import { PrismaClient } from "@prisma/client";
import { findMerchantCategory, getAllCategories } from "../category.js";
import dotenv from "dotenv";
import fs from "fs";
import sharp from "sharp";
import path from "path";

dotenv.config();

const router = express.Router();
const prisma = new PrismaClient();
const databaseUrl = process.env.DATABASE_URL;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Validate required environment variables
if (!process.env.OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY is not set in environment variables");
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set in environment variables");
  process.exit(1);
}

// Formats we pass through as-is
const DIRECT_OK = new Set(["image/jpeg", "image/png", "image/webp"]);

// Formats we convert to JPEG
const CONVERT_TO_JPEG = new Set([
  "image/heic",
  "image/heif",
  "image/gif", // sharp uses first frame
  "image/bmp",
  "image/tiff",
]);

// Optional: if you want to support PDFs, rasterize page 1 yourself to PNG/JPEG
// (use a lib like pdf-poppler or pdf2pic) and then feed that buffer to OpenAI.

async function normalizeImageForOpenAI(file) {
  let { buffer, mimetype } = file;

  // Pass-through
  if (DIRECT_OK.has(mimetype)) {
    return { buffer, mimeType: mimetype };
  }

  // Convert “exotic” types → JPEG
  if (CONVERT_TO_JPEG.has(mimetype)) {
    try {
      const out = await sharp(buffer)
        // For GIF/WEBP multi-frame inputs, sharp reads first frame by default
        .jpeg({ quality: 92, mozjpeg: true })
        .toBuffer();
      return { buffer: out, mimeType: "image/jpeg" };
    } catch (e) {
      throw Object.assign(new Error(`Failed to convert ${mimetype} to JPEG`), {
        status: 415,
      });
    }
  }

  // Not supported
  throw Object.assign(new Error(`Unsupported image type: ${mimetype}`), {
    status: 415,
  });
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Set up multer storage for file uploads
const storage = multer.memoryStorage();
const allowedTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "image/gif",
  "image/bmp",
  "image/tiff",
  // "application/pdf", // if you later add PDF rasterization
];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
  },
});

// Helper function to parse receipt with OpenAI Vision API
async function parseReceiptWithOpenAI(imageBuffer, mimeType = "image/jpeg") {
  try {
    const base64 = imageBuffer.toString("base64");
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" }, // <-- strict JSON
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are an AI receipt-parser used in a production Node.js backend. Extract fields using this schema:

{
  "merchant_name": "", "merchant_address": "", "merchant_phone": "", "category": "",
  "date": "YYYY-MM-DD", "time": "HH:MM", "currency": "",
  "subtotal": 0.00, "tax_amount": 0.00, "total_amount": 0.00,
  "payment_method": "", "receipt_number": "",
  "items": [{"name":"","quantity":1,"unit_price":0.00,"line_total":0.00,"item_category":""}],
  "notes": ""
}

Rules:
- category must be one of: ${getAllCategories().join(", ")}
- If unknown, use "" or 0.00. Return ONLY the JSON object.`,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64}`, // <-- use real mimetype
                detail: "high",
              },
            },
          ],
        },
      ],
      max_tokens: 1200,
      temperature: 0.1,
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content) throw new Error("Empty response from OpenAI");
    const parsedData = JSON.parse(content); // <-- no regex

    // Normalize numbers and validate (don't treat 0 as missing)
    const num = (v) =>
      v === null || v === undefined || v === "" ? null : Number(v);
    parsedData.total_amount = num(parsedData.total_amount);
    parsedData.subtotal = num(parsedData.subtotal);
    parsedData.tax_amount = num(parsedData.tax_amount);

    if (!parsedData.merchant_name || parsedData.total_amount == null) {
      throw new Error("Missing required fields: merchant_name or total_amount");
    }

    const merchantCategory = findMerchantCategory(parsedData.category);

    return {
      merchant: parsedData.merchant_name,
      merchant_address: parsedData.merchant_address || "",
      merchant_phone: parsedData.merchant_phone || "",
      date: parsedData.date || "",
      time: parsedData.time || "",
      currency: parsedData.currency || "",
      subtotal: parsedData.subtotal ?? 0,
      tax_amount: parsedData.tax_amount ?? 0,
      total_amount: parsedData.total_amount, // number
      payment_method: parsedData.payment_method || "",
      receipt_number: parsedData.receipt_number || "",
      items: Array.isArray(parsedData.items) ? parsedData.items : [],
      notes: parsedData.notes || "",
      category: parsedData.category || "Others",
      merchant_category: merchantCategory || "Others",
      transaction_category: parsedData.category || "Others",
    };
  } catch (error) {
    console.error("OpenAI Vision API error:", error?.response?.data || error);
    throw new Error("Failed to parse receipt with AI");
  }
}

async function parseReceiptFromPdf(pdfBuffer) {
  try {
    const parse = await getPdfParse();
    const { text } = await parse(pdfBuffer);
    if (!text || !text.trim()) {
      throw new Error("Empty or unreadable PDF text");
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are an AI receipt-parser used in a production Node.js backend. The following is raw text extracted from a PDF receipt. Extract fields using this schema:
{
  "merchant_name": "", "merchant_address": "", "merchant_phone": "", "category": "",
  "date": "YYYY-MM-DD", "time": "HH:MM", "currency": "",
  "subtotal": 0.00, "tax_amount": 0.00, "total_amount": 0.00,
  "payment_method": "", "receipt_number": "",
  "items": [{"name":"","quantity":1,"unit_price":0.00,"line_total":0.00,"item_category":""}],
  "notes": ""
}
Rules:
- category must be one of: ${getAllCategories().join(", ")}
- If unknown, use "" or 0.00. Return ONLY the JSON object.

--- PDF TEXT START ---
${text}
--- PDF TEXT END ---`,
            },
          ],
        },
      ],
      max_tokens: 1500,
      temperature: 0.1,
    });

    const content = response.choices[0].message.content;
    const parsed = JSON.parse(content);

    if (!parsed.merchant_name || parsed.total_amount === undefined) {
      throw new Error("Missing required fields: merchant_name or total_amount");
    }

    const merchantCategory = findMerchantCategory(parsed.category);
    return {
      merchant: parsed.merchant_name,
      merchant_address: parsed.merchant_address,
      merchant_phone: parsed.merchant_phone,
      date: parsed.date,
      time: parsed.time,
      currency: parsed.currency,
      subtotal: parsed.subtotal,
      tax_amount: parsed.tax_amount,
      total_amount: parsed.total_amount,
      payment_method: parsed.payment_method,
      receipt_number: parsed.receipt_number,
      items: parsed.items || [],
      notes: parsed.notes,
      category: parsed.category,
      merchant_category: merchantCategory,
      transaction_category: parsed.category || "Others",
    };
  } catch (error) {
    console.error("PDF parse pipeline error:", error);
    throw new Error("Failed to parse PDF receipt");
  }
}

// POST /api/voucher/upload - Upload and parse receipt
router.post("/upload", upload.single("receipt"), async (req, res) => {
  try {
    // Validate database connection
    if (!databaseUrl) {
      console.error("DATABASE_URL not found in environment variables");
      return res.status(500).json({ error: "Database configuration error" });
    }

    // Check if image was uploaded
    if (!req.file) {
      return res.status(400).json({ error: "No image provided." });
    }

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
      if (!req.file)
        return res.status(400).json({ error: "No image provided." });

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
      // If transaction creation fails, we should clean up the voucher and image
      try {
        await prisma.voucher.delete({ where: { id: voucher.id } });
        if (fs.existsSync(fullImagePath)) {
          fs.unlinkSync(fullImagePath);
        }
      } catch (cleanupError) {
        console.error(
          "Failed to cleanup voucher and image after transaction creation error:",
          cleanupError
        );
      }
      return res.status(500).json({ error: "Failed to create transaction" });
    }

    // Log successful upload
    console.log(`Receipt uploaded successfully for user ${userId}:`, {
      voucher_id: voucher.id,
      transaction_id: transaction.id,
      merchant: parsedData.merchant,
      amount: parsedData.total_amount,
      database_url: databaseUrl.split("@")[1]?.split("/")[0] || "database", // Log only host part for security
    });

    // Return success response
    return res.status(200).json({
      message: "Receipt uploaded and processed successfully.",
      voucher_id: voucher.id,
      transaction_id: transaction.id,
      parsed_data: {
        merchant: parsedData.merchant,
        category: parsedData.transaction_category || "Others",
        date: parsedData.date,
        total_amount: parsedData.total_amount,
        items: parsedData.items || [],
        merchant_category: parsedData.merchant_category || "Others",
      },
      editable_fields: [
        "merchant",
        "date",
        "total_amount",
        "items",
        "category",
      ],
      database_status: "connected",
    });
  } catch (error) {
    console.error("Error processing receipt upload:", error);

    if (error.message === "Only JPG or PNG allowed.") {
      return res.status(415).json({ error: error.message });
    }

    if (error.message.includes("Failed to parse receipt with AI")) {
      return res
        .status(500)
        .json({ error: "Failed to parse receipt. Try again later." });
    }

    // Check if it's a database connection error
    if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
      console.error("Database connection failed. DATABASE_URL:", databaseUrl);
      return res.status(500).json({
        error: "Database connection failed. Please check your configuration.",
      });
    }

    // Database or other internal errors
    return res
      .status(500)
      .json({ error: "Internal server error. Please try again." });
  }
});

// GET /api/vouchers - Get user's vouchers
router.get("/vouchers", async (req, res) => {
  try {
    const userId = req.query.user_id || 1; // Default to user 1 for testing

    const vouchers = await prisma.voucher.findMany({
      where: { user_id: parseInt(userId) },
      orderBy: { timestamp: "desc" },
    });

    res.json({ vouchers });
  } catch (error) {
    console.error("Error fetching vouchers:", error);
    res.status(500).json({ error: "Failed to fetch vouchers" });
  }
});

// GET /api/transactions - Get user's transactions
router.get("/transactions", async (req, res) => {
  try {
    const userId = req.query.user_id || 1; // Default to user 1 for testing

    const transactions = await prisma.transaction.findMany({
      where: { user_id: parseInt(userId) },
      orderBy: { date: "desc" },
    });

    res.json({ transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// [P0] GET /voucher/:id - Retrieve details of a specific voucher
router.get("/voucher/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid voucher id." });
    }

    const voucher = await prisma.voucher.findUnique({ where: { id } });
    if (!voucher) {
      return res.status(404).json({ error: "Voucher not found." });
    }

    const status = voucher.parsed_data ? "processed" : "pending";
    return res.status(200).json({
      voucher_id: voucher.id,
      status,
      image_url: voucher.image_path,
      parsed_data: voucher.parsed_data || null,
      created_at: voucher.timestamp,
    });
  } catch (error) {
    console.error("Error fetching voucher:", error);
    return res.status(500).json({ error: "Failed to fetch voucher." });
  }
});

// --- Validation helpers ---
function isValidDateYYYYMMDD(value) {
  if (typeof value !== "string") return false;
  const m = value.match(/^\d{4}-\d{2}-\d{2}$/);
  if (!m) return false;
  const d = new Date(value);
  return !isNaN(d.getTime());
}

function isPositiveNumber(value) {
  if (value === null || value === undefined) return false;
  const num = Number(value);
  return Number.isFinite(num) && num > 0;
}

// [P0] PUT /voucher/:id - Update/edit parsed voucher data
router.put("/voucher/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid voucher id." });
    }

    const voucher = await prisma.voucher.findUnique({ where: { id } });
    if (!voucher) {
      return res.status(404).json({ error: "Voucher not found." });
    }

    const allowedFields = [
      "merchant",
      "date",
      "total_amount",
      "items",
      "category",
      "currency",
      "notes",
      "time",
      "subtotal",
      "tax_amount",
      "payment_method",
      "receipt_number",
    ];

    const updates = {};
    for (const key of allowedFields) {
      if (key in req.body) updates[key] = req.body[key];
    }

    if (
      "date" in updates &&
      updates.date &&
      !isValidDateYYYYMMDD(updates.date)
    ) {
      return res
        .status(400)
        .json({ error: "Invalid date format. Use YYYY-MM-DD." });
    }

    if (
      "total_amount" in updates &&
      updates.total_amount !== undefined &&
      !isPositiveNumber(updates.total_amount)
    ) {
      return res
        .status(400)
        .json({ error: "total_amount must be a positive number." });
    }

    const mergedParsed = { ...(voucher.parsed_data || {}), ...updates };

    const updated = await prisma.voucher.update({
      where: { id },
      data: { parsed_data: mergedParsed },
    });

    return res.status(200).json({
      message: "Voucher updated successfully.",
      voucher_id: updated.id,
      parsed_data: updated.parsed_data,
    });
  } catch (error) {
    console.error("Error updating voucher:", error);
    return res.status(500).json({ error: "Failed to update voucher." });
  }
});

// [P0] POST /voucher/:id/confirm - Finalize voucher into a transaction
router.post("/voucher/:id/confirm", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid voucher id." });
    }

    const voucher = await prisma.voucher.findUnique({ where: { id } });
    if (!voucher) {
      return res.status(404).json({ error: "Voucher not found." });
    }

    const parsed = voucher.parsed_data || {};
    const overrides = req.body || {};
    const merged = { ...parsed, ...overrides };

    if (!merged.merchant || !isPositiveNumber(merged.total_amount)) {
      return res
        .status(400)
        .json({ error: "Missing or invalid merchant/total_amount." });
    }

    const chosenCategory =
      merged.transaction_category || merged.category || "Others";
    const merchantCategory =
      merged.merchant_category || findMerchantCategory(chosenCategory);

    const tx = await prisma.transaction.create({
      data: {
        user_id: voucher.user_id,
        date:
          merged.date && isValidDateYYYYMMDD(merged.date)
            ? new Date(merged.date)
            : new Date(),
        amount: Number(merged.total_amount),
        category: chosenCategory,
        merchant: merged.merchant,
        source: "voucher",
        receipt_img: voucher.image_path,
        merchant_category: merchantCategory || "Others",
      },
    });

    return res.status(200).json({
      message: "Voucher confirmed into transaction.",
      transaction_id: tx.id,
      voucher_id: voucher.id,
    });
  } catch (error) {
    console.error("Error confirming voucher:", error);
    return res.status(500).json({ error: "Failed to confirm voucher." });
  }
});

// [P0] DELETE /voucher/:id - Remove voucher
router.delete("/voucher/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid voucher id." });
    }

    const voucher = await prisma.voucher.findUnique({ where: { id } });
    if (!voucher) {
      return res.status(404).json({ error: "Voucher not found." });
    }

    await prisma.voucher.delete({ where: { id } });

    // Best-effort file cleanup
    try {
      if (voucher.image_path) {
        const absolutePath = path.join(process.cwd(), voucher.image_path);
        if (fs.existsSync(absolutePath)) fs.unlinkSync(absolutePath);
      }
    } catch (cleanupErr) {
      console.warn("Failed to remove voucher image:", cleanupErr?.message);
    }

    return res.status(200).json({ message: "Voucher deleted." });
  } catch (error) {
    console.error("Error deleting voucher:", error);
    return res.status(500).json({ error: "Failed to delete voucher." });
  }
});

// [P0] POST /voucher/bulk-upload - Batch receipt uploads
router.post(
  "/voucher/bulk-upload",
  upload.array("receipts", 10),
  async (req, res) => {
    try {
      const userId = parseInt(req.body.user_id) || 1;

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "No files provided." });
      }

      const results = [];
      const errors = [];

      for (const file of req.files) {
        try {
          const { buffer: normBuf, mimeType } = await normalizeImageForOpenAI(
            file
          );
          const parsedData = await parseReceiptWithOpenAI(normBuf, mimeType);

          if (!parsedData.merchant || !parsedData.total_amount) {
            throw new Error("Missing required fields after parsing");
          }

          const filename = `${Date.now()}_${file.originalname}`;
          const imagePath = `uploads/${filename}`;
          const fullImagePath = path.join(uploadsDir, filename);
          fs.writeFileSync(fullImagePath, file.buffer);

          const voucher = await prisma.voucher.create({
            data: {
              user_id: userId,
              image_path: imagePath,
              parsed_data: parsedData,
              timestamp: new Date(),
            },
          });

          const transaction = await prisma.transaction.create({
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

          results.push({
            file: file.originalname,
            voucher_id: voucher.id,
            transaction_id: transaction.id,
          });
        } catch (e) {
          console.error(
            "Bulk upload file failed:",
            file?.originalname,
            e?.message
          );
          errors.push({
            file: file?.originalname,
            error: e?.message || "parse_failed",
          });
        }
      }

      const status = errors.length > 0 ? 207 : 200;
      return res.status(status).json({ results, errors });
    } catch (error) {
      console.error("Bulk upload error:", error);
      return res.status(500).json({ error: "Bulk upload failed" });
    }
  }
);

export default router;
