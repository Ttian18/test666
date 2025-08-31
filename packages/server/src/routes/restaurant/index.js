import express from "express";
import { z } from "zod";
import { getRestaurantRecommendations } from "../../services/restaurant/recommendationService.js";
import { validateLocation } from "../../utils/validation/validationUtils.js";
import { getUserForPersonalization } from "../../services/auth/authUtils.js";
import recommendationRoutes from "./recommendationRoutes.js";
import zhongcaoRoutes from "./zhongcaoRoutes.js";
import menuAnalysisRoutes from "./menuAnalysisRoutes.js";
import {
  GetRestaurantRecommendationsRequestSchema,
  GetRestaurantRecommendationsResponseSchema,
  RecommendationErrorResponseSchema,
} from "@your-project/schema";

const router = express.Router();

// GET / - Personalized restaurant recommendations based on location (optional auth)
router.get("/", async (req, res) => {
  try {
    const { location } = req.query;

    // Check if user is authenticated (optional)
    const token = req.header("x-auth-token");
    const userData = await getUserForPersonalization(token);

    try {
      validateLocation(location);
    } catch (error) {
      const errorResponse = {
        error: error.message,
        code: "INVALID_LOCATION",
      };
      const validatedErrorResponse =
        RecommendationErrorResponseSchema.parse(errorResponse);
      return res.status(400).json(validatedErrorResponse);
    }

    // Create a query for restaurant recommendations in the specified location
    const query = `I'm looking for restaurant recommendations in ${location}. Please suggest good places to eat.`;

    // Prepare request data for validation
    const requestData = {
      query: query,
      userData: userData,
    };

    // Validate request data using Zod schema
    try {
      GetRestaurantRecommendationsRequestSchema.parse(requestData);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        const errorResponse = {
          error: "Validation failed",
          details: validationError.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        };
        const validatedErrorResponse =
          RecommendationErrorResponseSchema.parse(errorResponse);
        return res.status(400).json(validatedErrorResponse);
      }
      throw validationError;
    }

    // Pass validated request data to the service
    const result = await getRestaurantRecommendations(requestData);

    // Validate the result using response schema
    const validatedResult =
      GetRestaurantRecommendationsResponseSchema.parse(result);

    const response = {
      message: userData
        ? "Personalized restaurant recommendations"
        : "Restaurant recommendations",
      location: location,
      personalized: !!userData,
      recommendations: validatedResult.answer,
      query: validatedResult.query,
      steps: validatedResult.steps,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error getting recommendations:", error);

    if (error instanceof z.ZodError) {
      const errorResponse = {
        error: "Validation failed",
        details: error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      };
      const validatedErrorResponse =
        RecommendationErrorResponseSchema.parse(errorResponse);
      return res.status(400).json(validatedErrorResponse);
    }

    const errorResponse = {
      error: "Failed to get recommendations",
      details: error.message,
    };
    const validatedErrorResponse =
      RecommendationErrorResponseSchema.parse(errorResponse);
    res.status(500).json(validatedErrorResponse);
  }
});

// Mount sub-routes
router.use("/recommendations", recommendationRoutes);
router.use("/zhongcao", zhongcaoRoutes);
router.use("/menu-analysis", menuAnalysisRoutes);

export default router;
