import express from "express";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import {
  findMerchantCategory,
  getAllCategories,
} from "../../../../common/category.js";

// Configure dotenv
// http://localhost:5001/insights/summary?user_id=1&period=yearly&start_year=2023
// http://localhost:5001/insights/summary?user_id=1&period=yearly&start_year=2023&category=Food
dotenv.config();

// Initialize Prisma client with database URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ["query", "info", "warn", "error"],
});

const router = express.Router();

// Test database connection
async function testDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log("Database connection successful");
    return true;
  } catch (error) {
    console.error("Database connection failed:", error.message);
    return false;
  }
}

// Initialize database connection
testDatabaseConnection();

// Get all unique categories from transaction table
async function getAvailableCategories() {
  try {
    const uniqueCategories = await prisma.transaction.groupBy({
      by: ["category", "merchant_category"],
      _count: {
        id: true,
      },
    });

    return uniqueCategories.map((item) => ({
      category: item.category,
      merchant_category: item.merchant_category,
      count: item._count.id,
    }));
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

// Fetch transactions for a user from database
async function getUserTransactions(
  userId,
  startDate,
  endDate,
  category = null
) {
  try {
    console.log(
      `Fetching transactions for user ${userId} from ${startDate.toISOString()} to ${endDate.toISOString()}`
    );

    const whereCondition = {
      user_id: userId, // userId is already an integer
      date: {
        gte: startDate,
        lte: endDate,
      },
    };

    // Add category filter if specified - can filter by either category or merchant_category
    if (category) {
      whereCondition.OR = [
        {
          category: {
            contains: category,
            mode: "insensitive",
          },
        },
        {
          merchant_category: {
            contains: category,
            mode: "insensitive",
          },
        },
      ];
    }

    const transactions = await prisma.transaction.findMany({
      where: whereCondition,
      select: {
        id: true,
        date: true,
        amount: true,
        category: true,
        merchant: true,
        merchant_category: true,
        source: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    console.log(`Found ${transactions.length} transactions`);

    // Convert Decimal amounts to numbers and ensure dates are Date objects
    return transactions.map((tx) => ({
      ...tx,
      amount: parseFloat(tx.amount.toString()),
      date: new Date(tx.date),
    }));
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw new Error(
      `Failed to fetch transactions from database: ${error.message}`
    );
  }
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function startOfWeekMonday(date) {
  const d = startOfDay(date);
  const day = d.getDay(); // 0 (Sun) - 6 (Sat)
  const diffToMonday = (day + 6) % 7; // 0 if Monday
  d.setDate(d.getDate() - diffToMonday);
  return d;
}

function endOfWeekSunday(date) {
  const start = startOfWeekMonday(date);
  const end = endOfDay(new Date(start));
  end.setDate(start.getDate() + 6);
  return end;
}

function startOfMonth(date) {
  const d = startOfDay(date);
  d.setDate(1);
  return d;
}

function endOfMonth(date) {
  const d = startOfDay(date);
  d.setMonth(d.getMonth() + 1, 0); // move to last day of current month
  d.setHours(23, 59, 59, 999);
  return d;
}

function formatISODate(date) {
  return date.toISOString().slice(0, 10);
}

function getWindowForPeriod(period, startYear = null) {
  const currentYear = new Date().getFullYear();
  const targetStartYear = startYear || currentYear;

  switch ((period || "weekly").toLowerCase()) {
    case "daily": {
      const start = new Date(targetStartYear - 1, 0, 1); // Jan 1 of previous year
      const end = new Date(currentYear, 11, 31, 23, 59, 59, 999); // Dec 31 of current year
      return { start, end, bucket: "day" };
    }
    case "weekly": {
      const start = new Date(targetStartYear - 1, 0, 1); // Jan 1 of previous year
      const end = new Date(currentYear, 11, 31, 23, 59, 59, 999); // Dec 31 of current year
      return { start, end, bucket: "week" };
    }
    case "biweekly": {
      const start = new Date(targetStartYear - 1, 0, 1); // Jan 1 of previous year
      const end = new Date(currentYear, 11, 31, 23, 59, 59, 999); // Dec 31 of current year
      return { start, end, bucket: "biweek" };
    }
    case "monthly": {
      const start = new Date(targetStartYear - 1, 0, 1); // Jan 1 of previous year
      const end = new Date(currentYear, 11, 31, 23, 59, 59, 999); // Dec 31 of current year
      return { start, end, bucket: "month" };
    }
    case "yearly": {
      const start = new Date(targetStartYear - 1, 0, 1); // Jan 1 of previous year
      const end = new Date(currentYear, 11, 31, 23, 59, 59, 999); // Dec 31 of current year
      return { start, end, bucket: "year" };
    }
    default:
      return null;
  }
}

function buildTrendBuckets(start, end, bucket) {
  const buckets = [];
  const labels = [];
  let cursor = new Date(start); // Changed to 'let' so we can reassign it

  while (cursor <= end) {
    let bucketStart = new Date(cursor);
    let bucketEnd, label;

    switch (bucket) {
      case "day": {
        bucketEnd = endOfDay(cursor);
        label = formatISODate(cursor);
        cursor.setDate(cursor.getDate() + 1);
        break;
      }
      case "week": {
        bucketStart = startOfWeekMonday(cursor);
        bucketEnd = endOfWeekSunday(cursor);
        label = `Week ${formatISODate(bucketStart)}`;
        // Move to next Monday
        cursor = new Date(bucketEnd);
        cursor.setDate(cursor.getDate() + 1);
        break;
      }
      case "biweek": {
        bucketEnd = new Date(cursor);
        bucketEnd.setDate(bucketEnd.getDate() + 13);
        bucketEnd = endOfDay(bucketEnd);
        label = `${formatISODate(bucketStart)} - ${formatISODate(bucketEnd)}`;
        cursor.setDate(cursor.getDate() + 14);
        break;
      }
      case "month": {
        bucketStart = startOfMonth(cursor);
        bucketEnd = endOfMonth(cursor);
        label = `${cursor.getFullYear()}-${String(
          cursor.getMonth() + 1
        ).padStart(2, "0")}`;
        cursor.setMonth(cursor.getMonth() + 1, 1);
        break;
      }
      case "year": {
        bucketStart = new Date(cursor.getFullYear(), 0, 1);
        bucketEnd = new Date(cursor.getFullYear(), 11, 31, 23, 59, 59, 999);
        label = cursor.getFullYear().toString();
        cursor.setFullYear(cursor.getFullYear() + 1, 0, 1);
        break;
      }
      default: {
        bucketEnd = endOfDay(cursor);
        label = formatISODate(cursor);
        cursor.setDate(cursor.getDate() + 1);
      }
    }

    // Don't add buckets that start after our end date
    if (bucketStart > end) break;

    // Ensure bucket end doesn't exceed the overall end date
    if (bucketEnd > end) bucketEnd = new Date(end);

    buckets.push({
      from: bucketStart,
      to: bucketEnd,
    });
    labels.push(label);
  }

  return { buckets, labels };
}

function summarize(transactions, start, end, bucket) {
  const inWindow = transactions.filter((t) => t.date >= start && t.date <= end);

  let total = 0;
  const merchantCategoryTotals = {};
  const transactionCategoryTotals = {};

  // Initialize all predefined merchant categories
  getAllCategories().forEach((merchantCat) => {
    merchantCategoryTotals[merchantCat] = 0;
  });

  for (const tx of inWindow) {
    total += tx.amount;

    // Group by merchant category (from transaction table)
    const merchantCat = tx.merchant_category || "Others";
    if (merchantCategoryTotals[merchantCat] !== undefined) {
      merchantCategoryTotals[merchantCat] += tx.amount;
    } else {
      merchantCategoryTotals["Others"] += tx.amount;
    }

    // Group by specific transaction category
    const transCat = tx.category || "Others";
    if (!transactionCategoryTotals[transCat]) {
      transactionCategoryTotals[transCat] = 0;
    }
    transactionCategoryTotals[transCat] += tx.amount;
  }

  const { buckets, labels } = buildTrendBuckets(start, end, bucket);
  const trend = new Array(buckets.length).fill(0);
  for (const tx of inWindow) {
    for (let i = 0; i < buckets.length; i += 1) {
      const { from, to } = buckets[i];
      if (tx.date >= from && tx.date <= to) {
        trend[i] += tx.amount;
        break;
      }
    }
  }

  // Round to 2 decimals for presentation
  const roundedMerchantCategories = Object.fromEntries(
    Object.entries(merchantCategoryTotals).map(([k, v]) => [
      k,
      Math.round(v * 100) / 100,
    ])
  );

  const roundedTransactionCategories = Object.fromEntries(
    Object.entries(transactionCategoryTotals).map(([k, v]) => [
      k,
      Math.round(v * 100) / 100,
    ])
  );

  return {
    totalSpent: Math.round(total * 100) / 100,
    merchantCategoryBreakdown: roundedMerchantCategories,
    transactionCategoryBreakdown: roundedTransactionCategories,
    trend: trend.map((v) => Math.round(v * 100) / 100),
    trendLabels: labels,
  };
}

// GET /insights/summary
// Query: period=daily|weekly|biweekly|monthly|yearly, category=string (optional), start_year=number (optional)
router.get("/summary", async (req, res) => {
  try {
    const { period = "weekly", category, start_year } = req.query || {};

    // Check if user is authenticated (using same logic as transactionRoutes.js)
    const userId = parseInt(req.query.user_id) || 1; // Convert to integer and default to 1

    // Validate user exists in database
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Parse start year if provided
    const startYear = start_year ? parseInt(start_year) : null;

    const window = getWindowForPeriod(period, startYear);
    if (!window) {
      return res.status(400).json({
        error: "Invalid period",
        supported: ["daily", "weekly", "biweekly", "monthly", "yearly"],
      });
    }

    const { start, end, bucket } = window;

    // Fetch transaction data from database
    const transactions = await getUserTransactions(
      userId,
      start,
      end,
      category
    );

    // Generate summary from transaction data
    const summary = summarize(transactions, start, end, bucket);

    return res.status(200).json({
      period: String(period).toLowerCase(),
      start_date: formatISODate(start),
      end_date: formatISODate(end),
      total_spent: summary.totalSpent,
      merchant_category_breakdown: summary.merchantCategoryBreakdown,
      transaction_category_breakdown: summary.transactionCategoryBreakdown,
      trend: summary.trend,
      trend_labels: summary.trendLabels,
      transaction_count: transactions.length,
    });
  } catch (error) {
    console.error("Error generating spending summary:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: "Failed to generate spending summary",
      details: error.message,
    });
  }
});

// GET /insights/categories
// Returns available spending categories from database and predefined categories
router.get("/categories", async (req, res) => {
  try {
    const [availableCategories, predefinedCategories] = await Promise.all([
      getAvailableCategories(),
      Promise.resolve(getAllCategories()),
    ]);

    return res.status(200).json({
      predefined_categories: predefinedCategories,
      available_from_transactions: availableCategories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: "Failed to fetch categories",
    });
  }
});

// GET /insights/merchants
// Returns spending breakdown by merchant
router.get("/merchants", async (req, res) => {
  try {
    const { period = "monthly", limit = 10, start_year } = req.query || {};

    // Check if user is authenticated (using same logic as transactionRoutes.js)
    const userId = parseInt(req.query.user_id) || 1; // Convert to integer and default to 1

    // Validate user exists in database
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Parse start year if provided
    const startYear = start_year ? parseInt(start_year) : null;

    const window = getWindowForPeriod(period, startYear);
    if (!window) {
      return res.status(400).json({
        error: "Invalid period",
        supported: ["daily", "weekly", "biweekly", "monthly", "yearly"],
      });
    }

    const { start, end } = window;

    // Log the date range being used for debugging
    console.log(`📅 Date range for ${period} period:`, {
      start: start.toISOString(),
      end: end.toISOString(),
      startYear: start.getFullYear(),
      endYear: end.getFullYear(),
    });

    const merchantSummary = await prisma.transaction.groupBy({
      by: ["merchant", "merchant_category"],
      where: {
        user_id: userId,
        date: {
          gte: start,
          lte: end,
        },
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          amount: "desc",
        },
      },
      take: parseInt(limit),
    });

    const formattedSummary = merchantSummary.map((item) => ({
      merchant: item.merchant,
      merchant_category: item.merchant_category,
      total_spent: parseFloat(item._sum.amount.toString()),
      transaction_count: item._count.id,
    }));

    return res.status(200).json({
      period: String(period).toLowerCase(),
      start_date: formatISODate(start),
      end_date: formatISODate(end),
      top_merchants: formattedSummary,
    });
  } catch (error) {
    console.error("Error fetching merchant insights:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: "Failed to fetch merchant insights",
    });
  }
});

// GET /insights/chart-data
// Returns chart-friendly data with proper formatting for frontend charts
router.get("/chart-data", async (req, res) => {
  try {
    const {
      period = "weekly",
      category,
      start_year,
      chart_type = "spending",
    } = req.query || {};

    // Check if user is authenticated
    const userId = parseInt(req.query.user_id) || 1;

    // Validate user exists in database
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Parse start year if provided
    const startYear = start_year ? parseInt(start_year) : null;

    const window = getWindowForPeriod(period, startYear);
    if (!window) {
      return res.status(400).json({
        error: "Invalid period",
        supported: ["daily", "weekly", "biweekly", "monthly", "yearly"],
      });
    }

    const { start, end, bucket } = window;

    // Fetch transaction data from database
    const transactions = await getUserTransactions(
      userId,
      start,
      end,
      category
    );

    // Generate chart data based on chart type
    let chartData = {};

    if (chart_type === "spending") {
      // Spending trend chart data
      const summary = summarize(transactions, start, end, bucket);
      chartData = {
        type: "line",
        title: `Spending Trend - ${
          period.charAt(0).toUpperCase() + period.slice(1)
        }`,
        labels: summary.trendLabels,
        // datasets: [
        //   {
        //     label: "Total Spent",
        //     data: summary.trend,
        //     backgroundColor: "rgba(54, 162, 235, 0.2)",
        //     borderColor: "rgba(54, 162, 235, 1)",
        //     borderWidth: 2,
        //     fill: true,
        //   }
        // ],
        totalSpent: summary.totalSpent,
      };
    } else if (chart_type === "category") {
      // Category breakdown pie/doughnut chart
      const summary = summarize(transactions, start, end, bucket);
      const categories = Object.entries(summary.transactionCategoryBreakdown)
        .filter(([_, value]) => value > 0)
        .sort(([_, a], [__, b]) => b - a);

      chartData = {
        type: "doughnut",
        title: "Spending by Category",
        labels: categories.map(([category, _]) => category),
        // datasets: [
        //   {
        //     label: "Amount Spent",
        //     data: categories.map(([_, amount]) => amount),
        //     backgroundColor: [
        //       "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF",
        //       "#FF9F40", "#FF6384", "#C9CBCF", "#4BC0C0", "#FF6384"
        //     ],
        //     borderWidth: 1,
        //   }
        // ],
        totalSpent: summary.totalSpent,
      };
    } else if (chart_type === "merchant") {
      // Top merchants bar chart
      const merchantData = await prisma.transaction.groupBy({
        by: ["merchant"],
        where: {
          user_id: userId,
          date: {
            gte: start,
            lte: end,
          },
          ...(category && {
            OR: [
              { category: { contains: category, mode: "insensitive" } },
              {
                merchant_category: { contains: category, mode: "insensitive" },
              },
            ],
          }),
        },
        _sum: {
          amount: true,
        },
        orderBy: {
          _sum: {
            amount: "desc",
          },
        },
        take: 10,
      });

      const merchants = merchantData.map((item) => ({
        merchant: item.merchant,
        amount: parseFloat(item._sum.amount.toString()),
      }));

      chartData = {
        type: "bar",
        title: "Top 10 Merchants",
        labels: merchants.map((m) => m.merchant),
        // datasets: [
        //   {
        //     label: "Amount Spent",
        //     data: merchants.map(m => m.amount),
        //     backgroundColor: "rgba(75, 192, 192, 0.6)",
        //     borderColor: "rgba(75, 192, 192, 1)",
        //     borderWidth: 1,
        //   }
        // ],
        totalSpent: merchants.reduce((sum, m) => sum + m.amount, 0),
      };
    } else {
      return res.status(400).json({
        error: "Invalid chart_type",
        supported: ["spending", "category", "merchant"],
      });
    }

    return res.status(200).json({
      success: true,
      period: String(period).toLowerCase(),
      start_date: formatISODate(start),
      end_date: formatISODate(end),
      chart_type,
      category: category || "all",
      transaction_count: transactions.length,
      chart_data: chartData,
    });
  } catch (error) {
    console.error("Error generating chart data:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: "Failed to generate chart data",
      details: error.message,
    });
  }
});

export default router;
