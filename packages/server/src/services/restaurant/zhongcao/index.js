import { extractInfoFromImage } from "./imageExtraction.js";
import {
  createZhongcaoResult,
  getAllZhongcaoResults,
  getZhongcaoResultById,
  updateZhongcaoResult,
  deleteZhongcaoResult,
} from "./crudOperations.js";

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

// Re-export CRUD operations for backward compatibility
export {
  createZhongcaoResult,
  getAllZhongcaoResults,
  getZhongcaoResultById,
  updateZhongcaoResult,
  deleteZhongcaoResult,
} from "./crudOperations.js";

// Re-export image extraction for direct use
export { extractInfoFromImage } from "./imageExtraction.js";
