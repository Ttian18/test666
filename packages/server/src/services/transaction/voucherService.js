import { PrismaClient } from "@prisma/client";
import { findMerchantCategory, getAllCategories } from "common";
import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { normalizeImageForOpenAI } from "../../utils/upload/uploadUtils.js";

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Voucher Service - User-scoped voucher processing and management
 * All functions require a valid userId (integer from Prisma User model)
 */

/**
 * Parse receipt with OpenAI Vision API
 * @param {Buffer} imageBuffer - Image buffer
 * @param {string} mimeType - MIME type of the image
 * @returns {Promise<Object>} Parsed receipt data
 */
async function parseReceiptWithOpenAI(imageBuffer, mimeType) {
  const base64 = imageBuffer.toString("base64");
  const dataUrl = `data:${mimeType};base64,${base64}`;

  const systemPrompt = `You are a receipt parsing expert. Extract key information from receipt images and return structured JSON data.`;

  const userPrompt = `Parse this receipt image and extract the following information in JSON format:
  {
    "date": "YYYY-MM-DD",
    "time": "HH:MM",
    "merchant": "store/restaurant name",
    "total_amount": 0.00,
    "tax_amount": 0.00,
    "items": [
      {
        "name": "item name",
        "quantity": 1,
        "price": 0.00
      }
    ],
    "payment_method": "cash/card/other",
    "transaction_id": "receipt transaction ID if available"
  }

  Important guidelines:
  - Return only valid JSON, no additional text
  - Use null for missing information
  - Ensure total_amount is a number
  - Date should be in YYYY-MM-DD format
  - Time should be in HH:MM format (24-hour)
  - Extract all visible items with their quantities and prices`;

  try {
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
      max_tokens: 1000,
      temperature: 0.1,
    });

    let content = response.choices[0]?.message?.content?.trim();
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    // Handle markdown code block
    if (content.startsWith("```json")) {
      content = content.substring(7, content.length - 3).trim();
    }

    const parsedData = JSON.parse(content);

    // Enhance with merchant category
    const merchantCategory = findMerchantCategory(parsedData.merchant);
    const transactionCategory =
      mapMerchantToTransactionCategory(merchantCategory);

    return {
      ...parsedData,
      merchant_category: merchantCategory,
      transaction_category: transactionCategory,
    };
  } catch (error) {
    console.error("OpenAI parsing error:", error);
    throw new Error(`Failed to parse receipt: ${error.message}`);
  }
}

/**
 * Map merchant category to transaction category
 * @param {string} merchantCategory - Merchant category
 * @returns {string} Transaction category
 */
function mapMerchantToTransactionCategory(merchantCategory) {
  const categoryMap = {
    "Food & Dining": "Food",
    Grocery: "Food",
    "Gas & Fuel": "Transportation",
    Shopping: "Shopping",
    Entertainment: "Entertainment",
    "Health & Medical": "Healthcare",
    Travel: "Travel",
    Education: "Education",
    Utilities: "Bills",
  };

  return categoryMap[merchantCategory] || "Others";
}

/**
 * Process a single voucher (upload and parse)
 * @param {number} userId - The user's ID
 * @param {Object} fileData - File data with buffer and metadata
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} Processed voucher with transaction
 */
export const processVoucher = async (userId, fileData, options = {}) => {
  if (!userId || typeof userId !== "number") {
    throw new Error("Valid user ID (integer) is required");
  }

  if (!fileData || !fileData.buffer) {
    throw new Error("Valid file data with buffer is required");
  }

  const { buffer, originalname, mimetype } = fileData;
  const { createTransaction = true } = options;

  try {
    // Normalize image for OpenAI
    const { buffer: normBuf, mimeType } = await normalizeImageForOpenAI({
      buffer,
      mimetype,
    });

    // Parse receipt with OpenAI
    const parsedData = await parseReceiptWithOpenAI(normBuf, mimeType);

    // Validate parsed data
    if (!parsedData.merchant || !parsedData.total_amount) {
      throw new Error("Failed to extract required information from receipt");
    }

    // Save image file
    const uploadsDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filename = `${Date.now()}_${originalname}`;
    const imagePath = `uploads/${filename}`;
    const fullImagePath = path.join(uploadsDir, filename);

    fs.writeFileSync(fullImagePath, buffer);

    // Create voucher in database
    const voucher = await prisma.voucher.create({
      data: {
        user_id: userId,
        image_path: imagePath,
        parsed_data: parsedData,
        timestamp: new Date(),
      },
    });

    let transaction = null;

    // Create transaction if requested
    if (createTransaction) {
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
      } catch (transactionError) {
        console.error("Error creating transaction:", transactionError);
        // Don't fail the voucher creation if transaction fails
      }
    }

    return {
      voucher,
      transaction,
      parsedData,
      imagePath,
    };
  } catch (error) {
    console.error("Error processing voucher:", error);
    throw new Error(`Failed to process voucher: ${error.message}`);
  }
};

/**
 * Process multiple vouchers in bulk
 * @param {number} userId - The user's ID
 * @param {Array} filesData - Array of file data objects
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} Bulk processing results
 */
export const processBulkVouchers = async (userId, filesData, options = {}) => {
  if (!userId || typeof userId !== "number") {
    throw new Error("Valid user ID (integer) is required");
  }

  if (!Array.isArray(filesData) || filesData.length === 0) {
    throw new Error("Valid files data array is required");
  }

  const results = [];
  const errors = [];

  for (const fileData of filesData) {
    try {
      const result = await processVoucher(userId, fileData, options);
      results.push({
        filename: fileData.originalname,
        success: true,
        voucher_id: result.voucher.id,
        transaction_id: result.transaction?.id,
        parsed_data: result.parsedData,
      });
    } catch (error) {
      errors.push({
        filename: fileData.originalname,
        error: error.message,
      });
    }
  }

  return {
    successful: results.length,
    failed: errors.length,
    results,
    errors,
  };
};

/**
 * Get all vouchers for a user
 * @param {number} userId - The user's ID
 * @param {Object} options - Query options
 * @param {number} options.limit - Limit number of results
 * @param {number} options.offset - Offset for pagination
 * @param {Date} options.startDate - Filter from date
 * @param {Date} options.endDate - Filter to date
 * @returns {Promise<Array>} Array of user's vouchers
 */
export const getUserVouchers = async (userId, options = {}) => {
  if (!userId || typeof userId !== "number") {
    throw new Error("Valid user ID (integer) is required");
  }

  const { limit, offset, startDate, endDate } = options;
  const where = { user_id: userId };

  if (startDate || endDate) {
    where.timestamp = {};
    if (startDate) where.timestamp.gte = new Date(startDate);
    if (endDate) where.timestamp.lte = new Date(endDate);
  }

  return await prisma.voucher.findMany({
    where,
    orderBy: { timestamp: "desc" },
    take: limit,
    skip: offset,
    include: {
      user: {
        select: { id: true, email: true, name: true },
      },
    },
  });
};

/**
 * Get a specific voucher by ID (user-scoped)
 * @param {number} userId - The user's ID
 * @param {number} voucherId - The voucher ID
 * @returns {Promise<Object|null>} Voucher object or null
 */
export const getVoucherById = async (userId, voucherId) => {
  if (!userId || typeof userId !== "number") {
    throw new Error("Valid user ID (integer) is required");
  }

  if (!voucherId || typeof voucherId !== "number") {
    throw new Error("Valid voucher ID (integer) is required");
  }

  return await prisma.voucher.findFirst({
    where: {
      id: voucherId,
      user_id: userId, // Ensure user can only access their own vouchers
    },
    include: {
      user: {
        select: { id: true, email: true, name: true },
      },
    },
  });
};

/**
 * Update voucher parsed data (user-scoped)
 * @param {number} userId - The user's ID
 * @param {number} voucherId - The voucher ID
 * @param {Object} parsedData - Updated parsed data
 * @returns {Promise<Object|null>} Updated voucher or null if not found
 */
export const updateVoucher = async (userId, voucherId, parsedData) => {
  if (!userId || typeof userId !== "number") {
    throw new Error("Valid user ID (integer) is required");
  }

  if (!voucherId || typeof voucherId !== "number") {
    throw new Error("Valid voucher ID (integer) is required");
  }

  if (!parsedData) {
    throw new Error("Parsed data is required");
  }

  // First check if voucher exists and belongs to user
  const existingVoucher = await getVoucherById(userId, voucherId);
  if (!existingVoucher) {
    return null;
  }

  // Update voucher
  const updatedVoucher = await prisma.voucher.update({
    where: { id: voucherId },
    data: { parsed_data: parsedData },
    include: {
      user: {
        select: { id: true, email: true, name: true },
      },
    },
  });

  // Update corresponding transaction if it exists
  await prisma.transaction.updateMany({
    where: {
      user_id: userId,
      receipt_img: existingVoucher.image_path,
    },
    data: {
      amount: parsedData.total_amount,
      category: parsedData.transaction_category || "Others",
      merchant: parsedData.merchant,
      merchant_category: parsedData.merchant_category || "Others",
    },
  });

  return updatedVoucher;
};

/**
 * Confirm voucher and create transaction
 * @param {number} userId - The user's ID
 * @param {number} voucherId - The voucher ID
 * @returns {Promise<Object|null>} Created transaction or null if voucher not found
 */
export const confirmVoucher = async (userId, voucherId) => {
  if (!userId || typeof userId !== "number") {
    throw new Error("Valid user ID (integer) is required");
  }

  if (!voucherId || typeof voucherId !== "number") {
    throw new Error("Valid voucher ID (integer) is required");
  }

  const voucher = await getVoucherById(userId, voucherId);
  if (!voucher) {
    return null;
  }

  // Check if transaction already exists
  const existingTransaction = await prisma.transaction.findFirst({
    where: {
      user_id: userId,
      receipt_img: voucher.image_path,
    },
  });

  if (existingTransaction) {
    throw new Error("Transaction already exists for this voucher");
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

  return transaction;
};

/**
 * Delete a voucher (user-scoped)
 * @param {number} userId - The user's ID
 * @param {number} voucherId - The voucher ID
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
export const deleteVoucher = async (userId, voucherId) => {
  if (!userId || typeof userId !== "number") {
    throw new Error("Valid user ID (integer) is required");
  }

  if (!voucherId || typeof voucherId !== "number") {
    throw new Error("Valid voucher ID (integer) is required");
  }

  const voucher = await getVoucherById(userId, voucherId);
  if (!voucher) {
    return false;
  }

  // Delete associated transactions
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

  // Clean up image file
  try {
    const fullImagePath = path.join(process.cwd(), voucher.image_path);
    if (fs.existsSync(fullImagePath)) {
      fs.unlinkSync(fullImagePath);
    }
  } catch (cleanupError) {
    console.error("Failed to cleanup image file:", cleanupError);
    // Don't fail the deletion if file cleanup fails
  }

  return true;
};

/**
 * Get voucher statistics for a user
 * @param {number} userId - The user's ID
 * @param {Object} options - Query options
 * @param {Date} options.startDate - Start date for statistics
 * @param {Date} options.endDate - End date for statistics
 * @returns {Promise<Object>} Voucher statistics
 */
export const getVoucherStats = async (userId, options = {}) => {
  if (!userId || typeof userId !== "number") {
    throw new Error("Valid user ID (integer) is required");
  }

  const { startDate, endDate } = options;
  const where = { user_id: userId };

  if (startDate || endDate) {
    where.timestamp = {};
    if (startDate) where.timestamp.gte = new Date(startDate);
    if (endDate) where.timestamp.lte = new Date(endDate);
  }

  const [totalVouchers, totalProcessed] = await Promise.all([
    prisma.voucher.count({ where }),
    prisma.transaction.count({
      where: {
        user_id: userId,
        source: "voucher",
        ...(startDate || endDate
          ? {
              created_at: {
                ...(startDate && { gte: new Date(startDate) }),
                ...(endDate && { lte: new Date(endDate) }),
              },
            }
          : {}),
      },
    }),
  ]);

  return {
    totalVouchers,
    totalProcessed,
    processingRate:
      totalVouchers > 0 ? (totalProcessed / totalVouchers) * 100 : 0,
  };
};
