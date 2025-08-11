import express from "express";
import { searchWithCustomAgent } from "../test_1.mjs";

const router = express.Router();

// GET /recommendations - Personalized restaurant recommendations based on location
router.get("/", async (req, res) => {
  try {
    const { location } = req.query;

    if (!location) {
      return res.status(400).json({
        error:
          "Location parameter is required. Please provide a location query parameter.",
      });
    }

    // Create a query for restaurant recommendations in the specified location
    const query = `I'm looking for restaurant recommendations in ${location}. Please suggest good places to eat.`;

    const result = await searchWithCustomAgent(query);

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

// Placeholder for POST /recommendations/social-upload
router.post("/social-upload", (req, res) => {
  res
    .status(200)
    .json({ message: "Endpoint for social proof recommendations" });
});

// Placeholder for POST /recommendations/menu-analysis
router.post("/menu-analysis", (req, res) => {
  res.status(200).json({ message: "Endpoint for AI menu analysis" });
});

export default router;
