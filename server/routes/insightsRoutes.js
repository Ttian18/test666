import express from "express";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { findMerchantCategory } from "../category.js";

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
      const start = new Date(targetStartYear, 0, 1); // Jan 1 of start year
      const end = new Date(currentYear, 11, 31, 23, 59, 59, 999); // Dec 31 of current year
      return { start, end, bucket: "day" };
    }
    case "weekly": {
      const start = new Date(targetStartYear, 0, 1); // Jan 1 of start year
      const end = new Date(currentYear, 11, 31, 23, 59, 59, 999); // Dec 31 of current year
      return { start, end, bucket: "week" };
    }
    case "biweekly": {
      const start = new Date(targetStartYear, 0, 1); // Jan 1 of start year
      const end = new Date(currentYear, 11, 31, 23, 59, 59, 999); // Dec 31 of current year
      return { start, end, bucket: "biweek" };
    }
    case "monthly": {
      const start = new Date(targetStartYear, 0, 1); // Jan 1 of start year
      const end = new Date(currentYear, 11, 31, 23, 59, 59, 999); // Dec 31 of current year
      return { start, end, bucket: "month" };
    }
    case "yearly": {
      const start = new Date(targetStartYear, 0, 1); // Jan 1 of start year
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
  Object.keys(category).forEach((merchantCat) => {
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
      Promise.resolve(category),
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

// // POST /insights/create-test-user - Create a test user for development
// router.post("/create-test-user", async (req, res) => {
//   try {
//     const user = await prisma.user.upsert({
//       where: { email: "test@example.com" },
//       update: {},
//       create: {
//         email: "test@example.com",
//         name: "Test User"
//       }
//     });

//     res.json({
//       message: "Test user created successfully",
//       user: { id: user.id, email: user.email, name: user.name }
//     });
//   } catch (error) {
//     console.error("Error creating test user:", error);
//     res.status(500).json({ error: "Failed to create test user" });
//   }
// });

export default router;
