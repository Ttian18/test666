import express from "express";
import { getRestaurantRecommendations } from "../../services/restaurant/recommendationService.js";
import { validateLocation } from "../../utils/validation/validationUtils.js";
import menuAnalysisRoutes from "./menuAnalysisRoutes.js";
import zhongcaoRoutes from "./zhongcaoRoutes.js";

const router = express.Router();

// GET / - Personalized restaurant recommendations based on location
router.get("/", async (req, res) => {
  try {
    const { location } = req.query;

    try {
      validateLocation(location);
    } catch (error) {
      return res.status(400).json({
        error: error.message,
      });
    }

    // Create a query for restaurant recommendations in the specified location
    const query = `I'm looking for restaurant recommendations in ${location}. Please suggest good places to eat.`;

    const result = await getRestaurantRecommendations(query);

    res.status(200).json({
      message: "Personalized restaurant recommendations",
      location: location,
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
// Use the merged menuAnalysisRoutes for both paths to maintain backward compatibility

router.use("/menu-analysis", menuAnalysisRoutes);
router.use("/zhongcao", zhongcaoRoutes);

export default router;
