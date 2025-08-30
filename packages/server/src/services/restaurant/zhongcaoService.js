import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";
import { PrismaClient } from "@prisma/client";
import "dotenv/config";

// Use global prisma instance in tests, otherwise create new instance
const prisma = global.prisma || new PrismaClient();

// 1. Define the exact JSON structure you want for the output
const restaurantSchema = z.object({
  restaurant_name: z
    .string()
    .describe("The name of the restaurant mentioned in the screenshot."),
  dish_name: z
    .string()
    .nullable()
    .describe(
      "The specific dish featured, if mentioned. Return null if not mentioned."
    ),
  address: z
    .string()
    .nullable()
    .describe(
      "The address of the restaurant, if visible in the screenshot. Return null if not visible."
    ),
  description: z
    .string()
    .describe("A brief, one-sentence summary of the image content."),
  social_media_handle: z
    .string()
    .nullable()
    .describe(
      "The social media username or handle, if visible (e.g., @username). Return null if not visible."
    ),
});

// 2. Initialize the model and chain it with the schema
const model = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
}).withStructuredOutput(restaurantSchema);

function getFallbackRestaurantData() {
  return {
    restaurant_name: "Sample Restaurant",
    dish_name: null,
    address: null,
    description:
      "The image content is not visible, so no information can be extracted.",
    social_media_handle: null,
  };
}

/**
 * Extracts structured restaurant info from a local image file.
 * @param {string} imageFileName - The name of the image file located in the uploads directory.
 * @returns {Promise<object>} A promise that resolves to the structured data.
 */
export async function extractInfoFromImage(imageFileName) {
  console.log(`🤖 Analyzing ${imageFileName}...`);
  try {
    const imagePath = path.resolve(process.cwd(), "uploads", imageFileName);
    if (!fs.existsSync(imagePath)) {
      console.warn("Zhongcao image not found, returning fallback data");
      return getFallbackRestaurantData();
    }

    const base64Image = fs.readFileSync(imagePath, "base64");
    if (!base64Image || base64Image.length < 100) {
      console.warn("Zhongcao image too small, returning fallback data");
      return getFallbackRestaurantData();
    }

    const prompt = new HumanMessage({
      content: [
        {
          type: "text",
          text: "Extract information from this social media screenshot about a restaurant. Fulfill the schema based on the image content.",
        },
        {
          type: "image_url",
          image_url: { url: `data:image/png;base64,${base64Image}` },
        },
      ],
    });

    const response = await model.invoke([prompt]);

    // Normalize: ensure minimum fields and sensible defaults
    if (!response || typeof response !== "object") {
      return getFallbackRestaurantData();
    }

    const normalized = {
      restaurant_name:
        response.restaurant_name || getFallbackRestaurantData().restaurant_name,
      dish_name: response.dish_name ?? null,
      address: response.address ?? null,
      description:
        response.description || getFallbackRestaurantData().description,
      social_media_handle: response.social_media_handle ?? null,
    };

    return normalized;
  } catch (error) {
    console.error("Zhongcao extraction failed:", error.message);
    return getFallbackRestaurantData();
  }
}

// ==================== USER-AWARE CRUD OPERATIONS ====================

/**
 * Create a new zhongcao result for a specific user
 * @param {number} userId - The user ID (integer)
 * @param {object} data - The zhongcao result data
 * @returns {Promise<object>} The created zhongcao result
 */
export async function createZhongcaoResult(userId, data) {
  if (!userId || typeof userId !== "number") {
    throw new Error("Valid user ID (integer) is required");
  }

  const {
    originalFilename,
    restaurantName,
    dishName,
    address,
    description,
    socialMediaHandle,
  } = data;

  // Validate required fields
  if (!originalFilename || !restaurantName || !description) {
    throw new Error(
      "Missing required fields: originalFilename, restaurantName, description"
    );
  }

  return await prisma.zhongcaoResult.create({
    data: {
      user_id: userId,
      originalFilename,
      restaurantName,
      dishName: dishName || null,
      address: address || null,
      description,
      socialMediaHandle: socialMediaHandle || null,
      processedAt: new Date(),
    },
    include: {
      user: {
        select: { id: true, email: true, name: true },
      },
    },
  });
}

/**
 * Get all zhongcao results for a specific user
 * @param {number} userId - The user ID (integer)
 * @returns {Promise<Array>} Array of zhongcao results
 */
export async function getAllZhongcaoResults(userId) {
  if (!userId || typeof userId !== "number") {
    throw new Error("Valid user ID (integer) is required");
  }

  return await prisma.zhongcaoResult.findMany({
    where: { user_id: userId },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { id: true, email: true, name: true },
      },
    },
  });
}

/**
 * Get a specific zhongcao result by ID for a specific user
 * @param {number} userId - The user ID (integer)
 * @param {number} resultId - The zhongcao result ID
 * @returns {Promise<object|null>} The zhongcao result or null if not found
 */
export async function getZhongcaoResultById(userId, resultId) {
  if (!userId || typeof userId !== "number") {
    throw new Error("Valid user ID (integer) is required");
  }

  if (!resultId || typeof resultId !== "number") {
    throw new Error("Valid result ID (integer) is required");
  }

  return await prisma.zhongcaoResult.findFirst({
    where: {
      id: resultId,
      user_id: userId, // Ensure user can only access their own results
    },
    include: {
      user: {
        select: { id: true, email: true, name: true },
      },
    },
  });
}

/**
 * Update a specific zhongcao result for a specific user
 * @param {number} userId - The user ID (integer)
 * @param {number} resultId - The zhongcao result ID
 * @param {object} updateData - The data to update
 * @returns {Promise<object>} The updated zhongcao result
 */
export async function updateZhongcaoResult(userId, resultId, updateData) {
  if (!userId || typeof userId !== "number") {
    throw new Error("Valid user ID (integer) is required");
  }

  if (!resultId || typeof resultId !== "number") {
    throw new Error("Valid result ID (integer) is required");
  }

  // First check if the result exists and belongs to the user
  const existingResult = await getZhongcaoResultById(userId, resultId);
  if (!existingResult) {
    throw new Error("Zhongcao result not found or access denied");
  }

  const { restaurantName, dishName, address, description, socialMediaHandle } =
    updateData;

  // Validate required fields
  if (restaurantName !== undefined && !restaurantName) {
    throw new Error("restaurantName cannot be empty");
  }
  if (description !== undefined && !description) {
    throw new Error("description cannot be empty");
  }

  // Build update object with only provided fields
  const updateFields = {};
  if (restaurantName !== undefined)
    updateFields.restaurantName = restaurantName;
  if (dishName !== undefined) updateFields.dishName = dishName || null;
  if (address !== undefined) updateFields.address = address || null;
  if (description !== undefined) updateFields.description = description;
  if (socialMediaHandle !== undefined)
    updateFields.socialMediaHandle = socialMediaHandle || null;

  return await prisma.zhongcaoResult.update({
    where: { id: resultId },
    data: updateFields,
    include: {
      user: {
        select: { id: true, email: true, name: true },
      },
    },
  });
}

/**
 * Delete a specific zhongcao result for a specific user
 * @param {number} userId - The user ID (integer)
 * @param {number} resultId - The zhongcao result ID
 * @returns {Promise<object>} The deleted zhongcao result
 */
export async function deleteZhongcaoResult(userId, resultId) {
  if (!userId || typeof userId !== "number") {
    throw new Error("Valid user ID (integer) is required");
  }

  if (!resultId || typeof resultId !== "number") {
    throw new Error("Valid result ID (integer) is required");
  }

  // First check if the result exists and belongs to the user
  const existingResult = await getZhongcaoResultById(userId, resultId);
  if (!existingResult) {
    throw new Error("Zhongcao result not found or access denied");
  }

  return await prisma.zhongcaoResult.delete({
    where: { id: resultId },
  });
}

/**
 * Process an uploaded image and create a zhongcao result for a user
 * @param {number} userId - The user ID (integer)
 * @param {object} fileInfo - The uploaded file information
 * @returns {Promise<object>} The created zhongcao result with extracted info
 */
export async function processImageForUser(userId, fileInfo) {
  if (!userId || typeof userId !== "number") {
    throw new Error("Valid user ID (integer) is required");
  }

  if (!fileInfo || !fileInfo.filename || !fileInfo.originalname) {
    throw new Error("Valid file information is required");
  }

  console.log(
    `📸 Processing uploaded image for user ${userId}: ${fileInfo.filename}`
  );

  // Extract restaurant information from the uploaded image
  const extractedInfo = await extractInfoFromImage(fileInfo.filename);

  // Create the zhongcao result in the database
  const created = await createZhongcaoResult(userId, {
    originalFilename: fileInfo.originalname,
    restaurantName: extractedInfo.restaurant_name,
    dishName: extractedInfo.dish_name,
    address: extractedInfo.address,
    description: extractedInfo.description,
    socialMediaHandle: extractedInfo.social_media_handle,
  });

  return {
    result: created,
    extractedInfo,
    // Expose key fields at top-level for easier FE consumption
    restaurant_name:
      extractedInfo?.restaurant_name || created.restaurantName || "",
    dish_name: extractedInfo?.dish_name ?? created.dishName ?? null,
    address: extractedInfo?.address ?? created.address ?? null,
    description: extractedInfo?.description || created.description || "",
    social_media_handle:
      extractedInfo?.social_media_handle ?? created.socialMediaHandle ?? null,
  };
}
