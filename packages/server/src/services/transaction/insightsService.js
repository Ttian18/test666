import { PrismaClient } from "@prisma/client";
import { findMerchantCategory } from "common";

// Use global prisma instance in tests, otherwise create new instance
const prisma = global.prisma || new PrismaClient();

/**
 * Insights Service - User-scoped transaction analytics and insights
 * All functions require a valid userId (integer from Prisma User model)
 */

/**
 * Get spending summary for a user by period
 * @param {number} userId - The user's ID (integer)
 * @param {Object} options - Query options
 * @param {string} options.period - Period type: 'daily', 'weekly', 'monthly', 'yearly'
 * @param {string} options.category - Optional category filter
 * @param {number} options.startYear - Start year for analysis
 * @param {Date} options.startDate - Custom start date
 * @param {Date} options.endDate - Custom end date
 * @returns {Promise<Object>} Spending summary with period breakdown
 */
export const getSpendingSummary = async (userId, options = {}) => {
  if (
    !userId ||
    typeof userId !== "number" ||
    userId <= 0 ||
    !Number.isInteger(userId)
  ) {
    throw new Error("Valid user ID (integer) is required");
  }

  const {
    period = "monthly",
    category,
    startYear,
    startDate,
    endDate,
  } = options;

  // Build base where clause
  const where = { user_id: userId };

  if (category) {
    where.category = category;
  }

  // Handle date filtering
  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate);
    if (endDate) where.date.lte = new Date(endDate);
  } else if (startYear) {
    where.date = {
      gte: new Date(`${startYear}-01-01`),
      lte: new Date(`${startYear}-12-31`),
    };
  }

  // Get transactions for the period
  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: { date: "asc" },
  });

  // Group transactions by period
  const groupedData = groupTransactionsByPeriod(transactions, period);

  // Calculate summary statistics
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
  const averageAmount =
    transactions.length > 0 ? totalAmount / transactions.length : 0;

  return {
    userId,
    period,
    category: category || "all",
    summary: {
      totalTransactions: transactions.length,
      totalAmount,
      averageAmount,
      dateRange: {
        start: transactions.length > 0 ? transactions[0].date : null,
        end:
          transactions.length > 0
            ? transactions[transactions.length - 1].date
            : null,
      },
    },
    periodBreakdown: groupedData,
  };
};

/**
 * Get category analysis for a user
 * @param {number} userId - The user's ID
 * @param {Object} options - Query options
 * @param {Date} options.startDate - Start date for analysis
 * @param {Date} options.endDate - End date for analysis
 * @param {number} options.limit - Limit number of categories returned
 * @returns {Promise<Object>} Category analysis with spending breakdown
 */
export const getCategoryAnalysis = async (userId, options = {}) => {
  if (
    !userId ||
    typeof userId !== "number" ||
    userId <= 0 ||
    !Number.isInteger(userId)
  ) {
    throw new Error("Valid user ID (integer) is required");
  }

  const { startDate, endDate, limit = 10 } = options;
  const where = { user_id: userId };

  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate);
    if (endDate) where.date.lte = new Date(endDate);
  }

  // Get category breakdown
  const categoryData = await prisma.transaction.groupBy({
    by: ["category"],
    where,
    _sum: { amount: true },
    _count: { id: true },
    _avg: { amount: true },
    orderBy: { _sum: { amount: "desc" } },
    take: limit,
  });

  // Get total for percentage calculations
  const totalSpending = await prisma.transaction.aggregate({
    where,
    _sum: { amount: true },
  });

  const total = totalSpending._sum.amount || 0;

  return {
    userId,
    totalAmount: total,
    categories: categoryData.map((item) => ({
      category: item.category,
      totalAmount: item._sum.amount,
      transactionCount: item._count.id,
      averageAmount: item._avg.amount,
      percentage: total > 0 ? (item._sum.amount / total) * 100 : 0,
    })),
  };
};

/**
 * Get merchant analysis for a user
 * @param {number} userId - The user's ID
 * @param {Object} options - Query options
 * @param {Date} options.startDate - Start date for analysis
 * @param {Date} options.endDate - End date for analysis
 * @param {number} options.limit - Limit number of merchants returned
 * @returns {Promise<Object>} Merchant analysis with spending breakdown
 */
export const getMerchantAnalysis = async (userId, options = {}) => {
  if (
    !userId ||
    typeof userId !== "number" ||
    userId <= 0 ||
    !Number.isInteger(userId)
  ) {
    throw new Error("Valid user ID (integer) is required");
  }

  const { startDate, endDate, limit = 10 } = options;
  const where = { user_id: userId };

  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate);
    if (endDate) where.date.lte = new Date(endDate);
  }

  // Get merchant breakdown
  const merchantData = await prisma.transaction.groupBy({
    by: ["merchant"],
    where,
    _sum: { amount: true },
    _count: { id: true },
    _avg: { amount: true },
    orderBy: { _sum: { amount: "desc" } },
    take: limit,
  });

  // Enhance with merchant categories
  const enhancedData = merchantData.map((item) => ({
    merchant: item.merchant,
    totalAmount: item._sum.amount,
    transactionCount: item._count.id,
    averageAmount: item._avg.amount,
    merchantCategory: findMerchantCategory(item.merchant),
  }));

  // Calculate total amount across all merchants
  const totalAmount = enhancedData.reduce(
    (sum, merchant) => sum + merchant.totalAmount,
    0
  );

  return {
    userId,
    totalAmount,
    merchants: enhancedData,
  };
};

/**
 * Get spending trends over time for a user
 * @param {number} userId - The user's ID
 * @param {Object} options - Query options
 * @param {string} options.period - Period for trend: 'daily', 'weekly', 'monthly'
 * @param {number} options.periods - Number of periods to analyze
 * @returns {Promise<Object>} Spending trends with period comparisons
 */
export const getSpendingTrends = async (userId, options = {}) => {
  if (
    !userId ||
    typeof userId !== "number" ||
    userId <= 0 ||
    !Number.isInteger(userId)
  ) {
    throw new Error("Valid user ID (integer) is required");
  }

  const { period = "monthly", periods = 12 } = options;

  // Calculate date range based on period and periods
  const endDate = new Date();
  const startDate = new Date();

  switch (period) {
    case "daily":
      startDate.setDate(endDate.getDate() - periods);
      break;
    case "weekly":
      startDate.setDate(endDate.getDate() - periods * 7);
      break;
    case "monthly":
      startDate.setMonth(endDate.getMonth() - periods);
      break;
    default:
      throw new Error("Invalid period. Use 'daily', 'weekly', or 'monthly'");
  }

  const transactions = await prisma.transaction.findMany({
    where: {
      user_id: userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { date: "asc" },
  });

  const trendData = groupTransactionsByPeriod(transactions, period);

  // Calculate trend metrics
  const amounts = trendData.map((item) => item.totalAmount);
  const trend = calculateTrend(amounts);

  return {
    userId,
    period,
    periods,
    dateRange: { start: startDate, end: endDate },
    trend: {
      direction: trend.direction,
      percentage: trend.percentage,
      isSignificant: Math.abs(trend.percentage) > 10, // 10% threshold
    },
    periodData: trendData,
  };
};

/**
 * Get budget analysis for a user
 * @param {number} userId - The user's ID
 * @param {number} monthlyBudget - User's monthly budget
 * @param {Object} options - Query options
 * @param {Date} options.month - Specific month to analyze (defaults to current)
 * @returns {Promise<Object>} Budget analysis with spending vs budget
 */
export const getBudgetAnalysis = async (
  userId,
  monthlyBudget,
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

  if (
    !monthlyBudget ||
    typeof monthlyBudget !== "number" ||
    monthlyBudget <= 0
  ) {
    throw new Error("Valid monthly budget (number) is required");
  }

  const month = options.month || new Date();
  const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
  const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);

  const monthlySpending = await prisma.transaction.aggregate({
    where: {
      user_id: userId,
      date: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    _sum: { amount: true },
    _count: { id: true },
  });

  const totalSpent = monthlySpending._sum.amount || 0;
  const remaining = monthlyBudget - totalSpent;
  const percentageUsed = (totalSpent / monthlyBudget) * 100;

  // Get daily average for projections
  const daysInMonth = endOfMonth.getDate();
  const currentDay = new Date().getDate();
  const dailyAverage = totalSpent / currentDay;
  const projectedSpending = dailyAverage * daysInMonth;

  return {
    userId,
    month: {
      year: month.getFullYear(),
      month: month.getMonth() + 1,
    },
    budget: monthlyBudget,
    spent: totalSpent,
    remaining,
    percentageUsed,
    transactionCount: monthlySpending._count.id,
    dailyAverage,
    projectedSpending,
    status: getbudgetStatus(percentageUsed),
    isOverBudget: totalSpent > monthlyBudget,
  };
};

// Helper Functions

/**
 * Group transactions by time period
 * @param {Array} transactions - Array of transactions
 * @param {string} period - Period type
 * @returns {Array} Grouped transaction data
 */
function groupTransactionsByPeriod(transactions, period) {
  const groups = {};

  transactions.forEach((transaction) => {
    let key;
    const date = new Date(transaction.date);

    switch (period) {
      case "daily":
        key = date.toISOString().split("T")[0];
        break;
      case "weekly":
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split("T")[0];
        break;
      case "monthly":
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}`;
        break;
      case "yearly":
        key = date.getFullYear().toString();
        break;
      default:
        key = date.toISOString().split("T")[0];
    }

    if (!groups[key]) {
      groups[key] = {
        period: key,
        transactions: [],
        totalAmount: 0,
        transactionCount: 0,
      };
    }

    groups[key].transactions.push(transaction);
    groups[key].totalAmount += transaction.amount;
    groups[key].transactionCount += 1;
  });

  return Object.values(groups).sort((a, b) => a.period.localeCompare(b.period));
}

/**
 * Calculate trend direction and percentage
 * @param {Array} amounts - Array of amounts over time
 * @returns {Object} Trend analysis
 */
function calculateTrend(amounts) {
  if (amounts.length < 2) {
    return { direction: "stable", percentage: 0 };
  }

  const firstHalf = amounts.slice(0, Math.floor(amounts.length / 2));
  const secondHalf = amounts.slice(Math.floor(amounts.length / 2));

  const firstAvg =
    firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
  const secondAvg =
    secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

  const percentage =
    firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;

  let direction = "stable";
  if (percentage > 5) direction = "increasing";
  else if (percentage < -5) direction = "decreasing";

  return { direction, percentage };
}

/**
 * Get budget status based on percentage used
 * @param {number} percentageUsed - Percentage of budget used
 * @returns {string} Budget status
 */
function getbudgetStatus(percentageUsed) {
  if (percentageUsed <= 50) return "on_track";
  if (percentageUsed <= 80) return "warning";
  if (percentageUsed <= 100) return "critical";
  return "over_budget";
}
