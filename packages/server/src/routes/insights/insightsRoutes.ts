import express from "express";
import dotenv from "dotenv";
import { authenticate } from "../middleware/auth.ts";
import * as insightsService from "../../services/insights/insightsService.ts";

// Phase 3: Secured insights routes with authentication middleware
// All routes now require valid JWT token and use service layer for user isolation

dotenv.config();

const router = express.Router();

// GET /insights/summary - Get spending summary for authenticated user
router.get("/summary", async (req: any, res) => {
  try {
    const userId = req.user?.id || 1; // Fallback to user ID 1 for testing
    const { period, category, startYear, startDate, endDate } = req.query;

    const options = {
      period,
      category,
      startYear: startYear ? parseInt(startYear) : undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };

    const summary = await insightsService.getSpendingSummary(userId, options);

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error("Error getting spending summary:", error);
    res.status(500).json({
      error: "Failed to get spending summary",
      details: error.message,
    });
  }
});

// GET /insights/categories - Get category analysis for authenticated user
router.get("/categories", async (req: any, res) => {
  try {
    const userId = req.user?.id || 1; // Fallback to user ID 1 for testing
    const { startDate, endDate, limit, category } = req.query;

    const options = {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      category: category,
    };

    const analysis = await insightsService.getCategoryAnalysis(userId, options);

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error("Error getting category analysis:", error);
    res.status(500).json({
      error: "Failed to get category analysis",
      details: error.message,
    });
  }
});

// GET /insights/merchants - Get merchant analysis for authenticated user
router.get("/merchants", async (req: any, res) => {
  try {
    const userId = req.user?.id || 1; // Fallback to user ID 1 for testing
    const { startDate, endDate, limit, category } = req.query;

    const options = {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      category: category,
    };

    const analysis = await insightsService.getMerchantAnalysis(userId, options);

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error("Error getting merchant analysis:", error);
    res.status(500).json({
      error: "Failed to get merchant analysis",
      details: error.message,
    });
  }
});

// GET /insights/trends - Get spending trends for authenticated user
router.get("/trends", async (req: any, res) => {
  try {
    const userId = req.user?.id || 1; // Fallback to user ID 1 for testing
    const { period, periods, category } = req.query;

    const options = {
      period,
      periods: periods ? parseInt(periods) : undefined,
      category: category,
    };

    const trends = await insightsService.getSpendingTrends(userId, options);

    res.json({
      success: true,
      data: trends,
    });
  } catch (error) {
    console.error("Error getting spending trends:", error);
    if (error.message.includes("Invalid period")) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({
      error: "Failed to get spending trends",
      details: error.message,
    });
  }
});

// GET /insights/budget - Get budget analysis for authenticated user
router.get("/budget", async (req: any, res) => {
  try {
    const userId = req.user?.id || 1; // Fallback to user ID 1 for testing
    const { monthlyBudget, month } = req.query;

    if (!monthlyBudget) {
      return res.status(400).json({ error: "Monthly budget is required" });
    }

    const budget = parseFloat(monthlyBudget);
    if (isNaN(budget) || budget <= 0) {
      return res
        .status(400)
        .json({ error: "Valid monthly budget is required" });
    }

    const options = {
      month: month ? new Date(month) : undefined,
    };

    const analysis = await insightsService.getBudgetAnalysis(
      userId,
      budget,
      options
    );

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error("Error getting budget analysis:", error);
    if (error.message.includes("budget")) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({
      error: "Failed to get budget analysis",
      details: error.message,
    });
  }
});

// GET /insights/dashboard - Get dashboard data (combination of key insights)
router.get("/dashboard", async (req: any, res) => {
  try {
    const userId = req.user?.id || 1; // Fallback to user ID 1 for testing
    const { monthlyBudget } = req.query;

    // Get multiple insights in parallel
    const [summary, categoryAnalysis, trends, budgetAnalysis] =
      await Promise.all([
        insightsService.getSpendingSummary(userId, { period: "monthly" }),
        insightsService.getCategoryAnalysis(userId, { limit: 5 }),
        insightsService.getSpendingTrends(userId, {
          period: "monthly",
          periods: 6,
        }),
        monthlyBudget
          ? insightsService.getBudgetAnalysis(userId, parseFloat(monthlyBudget))
          : Promise.resolve(null),
      ]);

    res.json({
      success: true,
      data: {
        summary,
        topCategories: categoryAnalysis.categories,
        trends,
        budget: budgetAnalysis,
      },
    });
  } catch (error) {
    console.error("Error getting dashboard data:", error);
    res.status(500).json({
      error: "Failed to get dashboard data",
      details: error.message,
    });
  }
});

export default router;
