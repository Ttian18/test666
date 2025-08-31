import { PrismaClient } from "@prisma/client";

/** @typedef {import('schema').Transaction} Transaction */

// Use global prisma instance in tests, otherwise create new instance
const prisma = global.prisma || new PrismaClient();

/**
 * Transaction Service - User-scoped transaction operations
 * All functions require a valid userId (integer from Prisma User model)
 */

/**
 * Get all transactions for a specific user
 * @param {number} userId - The user's ID (integer)
 * @param {Object} options - Optional query parameters
 * @param {string} options.category - Filter by category
 * @param {Date} options.startDate - Filter from date
 * @param {Date} options.endDate - Filter to date
 * @param {number} options.limit - Limit number of results
 * @param {number} options.offset - Offset for pagination
 * @returns {Promise<Transaction[]>} Array of user's transactions
 */
export const getAllTransactions = async (userId, options = {}) => {
  if (
    !userId ||
    typeof userId !== "number" ||
    userId <= 0 ||
    !Number.isInteger(userId)
  ) {
    throw new Error("Valid user ID (integer) is required");
  }

  const { category, startDate, endDate, limit, offset } = options;

  // Build where clause
  const where = { user_id: userId };

  if (category) {
    where.category = category;
  }

  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate);
    if (endDate) where.date.lte = new Date(endDate);
  }

  return await prisma.transaction.findMany({
    where,
    orderBy: { date: "desc" },
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
 * Get a specific transaction by ID (user-scoped)
 * @param {number} userId - The user's ID
 * @param {number} transactionId - The transaction ID
 * @returns {Promise<Object|null>} Transaction object or null
 */
export const getTransactionById = async (userId, transactionId) => {
  if (
    !userId ||
    typeof userId !== "number" ||
    userId <= 0 ||
    !Number.isInteger(userId)
  ) {
    throw new Error("Valid user ID (integer) is required");
  }

  if (
    !transactionId ||
    typeof transactionId !== "number" ||
    transactionId <= 0 ||
    !Number.isInteger(transactionId)
  ) {
    throw new Error("Valid transaction ID (integer) is required");
  }

  return await prisma.transaction.findFirst({
    where: {
      id: transactionId,
      user_id: userId, // Ensure user can only access their own transactions
    },
    include: {
      user: {
        select: { id: true, email: true, name: true },
      },
    },
  });
};

/**
 * Create a new transaction for a user
 * @param {number} userId - The user's ID
 * @param {Object} transactionData - Transaction data
 * @returns {Promise<Object>} Created transaction
 */
export const createTransaction = async (userId, transactionData) => {
  if (
    !userId ||
    typeof userId !== "number" ||
    userId <= 0 ||
    !Number.isInteger(userId)
  ) {
    throw new Error("Valid user ID (integer) is required");
  }

  // Validate required fields
  const requiredFields = ["date", "amount", "category", "merchant", "source"];
  for (const field of requiredFields) {
    if (!transactionData[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  return await prisma.transaction.create({
    data: {
      ...transactionData,
      user_id: userId, // Always set the user_id to the authenticated user
      date: new Date(transactionData.date),
    },
    include: {
      user: {
        select: { id: true, email: true, name: true },
      },
    },
  });
};

/**
 * Update a transaction (user-scoped)
 * @param {number} userId - The user's ID
 * @param {number} transactionId - The transaction ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object|null>} Updated transaction or null if not found
 */
export const updateTransaction = async (userId, transactionId, updateData) => {
  if (
    !userId ||
    typeof userId !== "number" ||
    userId <= 0 ||
    !Number.isInteger(userId)
  ) {
    throw new Error("Valid user ID (integer) is required");
  }

  if (
    !transactionId ||
    typeof transactionId !== "number" ||
    transactionId <= 0 ||
    !Number.isInteger(transactionId)
  ) {
    throw new Error("Valid transaction ID (integer) is required");
  }

  // First check if transaction exists and belongs to user
  const existingTransaction = await getTransactionById(userId, transactionId);
  if (!existingTransaction) {
    return null;
  }

  // Prepare update data
  const processedUpdateData = { ...updateData };
  if (updateData.date) {
    processedUpdateData.date = new Date(updateData.date);
  }

  return await prisma.transaction.update({
    where: { id: transactionId },
    data: processedUpdateData,
    include: {
      user: {
        select: { id: true, email: true, name: true },
      },
    },
  });
};

/**
 * Delete a transaction (user-scoped)
 * @param {number} userId - The user's ID
 * @param {number} transactionId - The transaction ID
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
export const deleteTransaction = async (userId, transactionId) => {
  if (
    !userId ||
    typeof userId !== "number" ||
    userId <= 0 ||
    !Number.isInteger(userId)
  ) {
    throw new Error("Valid user ID (integer) is required");
  }

  if (
    !transactionId ||
    typeof transactionId !== "number" ||
    transactionId <= 0 ||
    !Number.isInteger(transactionId)
  ) {
    throw new Error("Valid transaction ID (integer) is required");
  }

  // First check if transaction exists and belongs to user
  const existingTransaction = await getTransactionById(userId, transactionId);
  if (!existingTransaction) {
    return false;
  }

  await prisma.transaction.delete({
    where: { id: transactionId },
  });

  return true;
};

/**
 * Get transaction statistics for a user
 * @param {number} userId - The user's ID
 * @param {Object} options - Optional parameters
 * @param {Date} options.startDate - Start date for statistics
 * @param {Date} options.endDate - End date for statistics
 * @returns {Promise<Object>} Transaction statistics
 */
export const getTransactionStats = async (userId, options = {}) => {
  if (
    !userId ||
    typeof userId !== "number" ||
    userId <= 0 ||
    !Number.isInteger(userId)
  ) {
    throw new Error("Valid user ID (integer) is required");
  }

  const { startDate, endDate } = options;
  const where = { user_id: userId };

  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate);
    if (endDate) where.date.lte = new Date(endDate);
  }

  const [totalTransactions, totalAmount, avgAmount] = await Promise.all([
    // Total count
    prisma.transaction.count({ where }),

    // Total amount
    prisma.transaction.aggregate({
      where,
      _sum: { amount: true },
    }),

    // Average amount
    prisma.transaction.aggregate({
      where,
      _avg: { amount: true },
    }),
  ]);

  // Get category breakdown
  const categoryBreakdown = await prisma.transaction.groupBy({
    by: ["category"],
    where,
    _sum: { amount: true },
    _count: { id: true },
    orderBy: { _sum: { amount: "desc" } },
  });

  return {
    totalTransactions,
    totalAmount: totalAmount._sum.amount || 0,
    averageAmount: avgAmount._avg.amount || 0,
    categoryBreakdown: categoryBreakdown.map((item) => ({
      category: item.category,
      totalAmount: item._sum.amount,
      transactionCount: item._count.id,
    })),
  };
};

/**
 * Get transactions by category for a user
 * @param {number} userId - The user's ID
 * @param {string} category - The category to filter by
 * @param {Object} options - Optional parameters
 * @returns {Promise<Array>} Transactions in the specified category
 */
export const getTransactionsByCategory = async (
  userId,
  category,
  options = {}
) => {
  if (
    !userId ||
    typeof userId !== "number" ||
    userId <= 0 ||
    !Number.isInteger(userId)
  ) {
    throw new Error("Valid user ID (integer) is required");
  }

  if (!category) {
    throw new Error("Category is required");
  }

  return await getAllTransactions(userId, { ...options, category });
};
