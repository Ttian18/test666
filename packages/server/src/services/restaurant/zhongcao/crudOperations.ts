import { PrismaClient } from "@prisma/client";

// Use global prisma instance in tests, otherwise create new instance
const prisma = global.prisma || new PrismaClient();

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
