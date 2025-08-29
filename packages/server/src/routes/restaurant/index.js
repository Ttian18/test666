import express from "express";
import { getRestaurantRecommendations } from "../../services/restaurant/recommendationService.js";
import { validateLocation } from "../../utils/validation/validationUtils.js";
import { authenticate } from "../middleware/auth.js";
import { PrismaClient } from "@prisma/client";
import recommendationRoutes from "./recommendationRoutes.js";
import zhongcaoRoutes from "./zhongcaoRoutes.js";
import menuAnalysisRoutes from "./menuAnalysisRoutes.js";

const prisma = new PrismaClient();
const router = express.Router();

// GET / - Personalized restaurant recommendations based on location (optional auth)
router.get("/", async (req, res) => {
  try {
    const { location } = req.query;
    let userData = null;

    // Check if user is authenticated (optional)
    const token = req.header("x-auth-token");
    if (token) {
      try {
        const jwt = await import("jsonwebtoken");
        const decoded = jwt.default.verify(
          token,
          process.env.JWT_SECRET || "your_secure_secret"
        );
        const user = await prisma.user.findUnique({
          where: { id: decoded.id },
          select: { id: true, email: true, name: true },
        });
        if (user) {
          // Get user profile data for personalization
          const Profile = (await import("../../models/entities/Profile.js"))
            .default;
          const profile = await Profile.findOne({ userId: user.id });
          if (profile) {
            userData = {
              name: user.name || user.email,
              email: user.email,
              monthlyBudget: profile.monthlyBudget,
              monthlyIncome: profile.monthlyIncome,
              expensePreferences: profile.expensePreferences,
              savingsGoals: profile.savingsGoals,
              lifestylePreferences: profile.lifestylePreferences,
            };
          }
        }
      } catch (authError) {
        // Ignore auth errors for optional authentication
        console.log("Optional auth failed:", authError.message);
      }
    }

    try {
      validateLocation(location);
    } catch (error) {
      return res.status(400).json({
        error: error.message,
      });
    }

    // Create a query for restaurant recommendations in the specified location
    const query = `I'm looking for restaurant recommendations in ${location}. Please suggest good places to eat.`;

    // Pass user data for personalization if available
    const result = await getRestaurantRecommendations(query, userData);

    res.status(200).json({
      message: userData
        ? "Personalized restaurant recommendations"
        : "Restaurant recommendations",
      location: location,
      personalized: !!userData,
      recommendations: result.answer,
      query: result.query,
      steps: result.steps,
    });
  } catch (error) {
    console.error("Error getting recommendations:", error);
    res.status(500).json({
      error: "Failed to get recommendations",
      details: error.message,
    });
  }
});

// Mount sub-routes
router.use("/recommendations", recommendationRoutes);
router.use("/zhongcao", zhongcaoRoutes);
router.use("/menu-analysis", menuAnalysisRoutes);

export default router;
