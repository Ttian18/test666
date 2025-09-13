import express from "express";
import { z } from "zod";
import { getRestaurantRecommendations } from "../../services/restaurant/recommendationService.ts";
import { validateLocation } from "../../utils/validation/validationUtils.ts";
import { getUserForPersonalization } from "../../services/auth/authUtils.ts";
import zhongcaoRoutes from "./zhongcaoRoutes.ts";
import menuAnalysisRoutes from "./menuAnalysisRoutes.ts";
import searchHistoryRoutes from "./searchHistoryRoutes.ts";
import {
  GetRestaurantRecommendationsRequestSchema,
  GetRestaurantRecommendationsResponseSchema,
  RecommendationErrorResponseSchema,
} from "schema";

const router = express.Router();

// GET / - Personalized restaurant recommendations based on location (REQUIRES AUTH)
router.get("/", async (req, res) => {
  try {
    const { location } = req.query;

    // Check if user is authenticated (REQUIRED)
    const token = req.header("x-auth-token");
    if (!token) {
      const errorResponse = {
        error: "Authentication required",
        code: "AUTHENTICATION_REQUIRED",
        details: [
          {
            field: "x-auth-token",
            message: "Authentication token is required",
          },
        ],
      };
      const validatedErrorResponse =
        RecommendationErrorResponseSchema.parse(errorResponse);
      return res.status(401).json(validatedErrorResponse);
    }

    const userData = await getUserForPersonalization(token);
    if (!userData) {
      const errorResponse = {
        error: "Invalid authentication token",
        code: "INVALID_TOKEN",
        details: [
          {
            field: "x-auth-token",
            message: "Invalid or expired authentication token",
          },
        ],
      };
      const validatedErrorResponse =
        RecommendationErrorResponseSchema.parse(errorResponse);
      return res.status(401).json(validatedErrorResponse);
    }

    try {
      // Ensure location is a string before validation
      if (typeof location !== "string") {
        throw new Error("Location parameter must be a string");
      }
      validateLocation(location);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorResponse = {
        error: errorMessage,
        code: "INVALID_LOCATION",
        details: [
          {
            field: "location",
            message: errorMessage,
          },
        ],
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
      userData: userData, // User data is now guaranteed to exist
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
      message: "Personalized restaurant recommendations",
      location: location,
      personalized: true,
      recommendations: validatedResult.answer,
      query: validatedResult.query,
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

    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorResponse = {
      error: "Failed to get recommendations",
      details: [
        {
          field: "general",
          message: errorMessage,
        },
      ],
    };
    const validatedErrorResponse =
      RecommendationErrorResponseSchema.parse(errorResponse);
    res.status(500).json(validatedErrorResponse);
  }
});

// Mount sub-routes (only authorized endpoints)
router.use("/zhongcao", zhongcaoRoutes);
router.use("/menu-analysis", menuAnalysisRoutes);
router.use("/search-history", searchHistoryRoutes);

export default router;
