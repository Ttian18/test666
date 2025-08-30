import express from "express";
import MenuAnalysisController from "../../services/restaurant/menuAnalysisController.js";
import MenuAnalysisService from "../../services/restaurant/menuAnalysisService.js";
import {
  handleError,
  createError,
} from "../../utils/errors/menuAnalysisErrors.js";
import menuAnalysisCache from "../../utils/cache/menuAnalysisCache.js";
import { uploadImageMemory } from "../../utils/upload/uploadUtils.js";
import { validateBudget } from "../../utils/validation/validationUtils.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Initialize controller and service
const menuAnalysisController = new MenuAnalysisController();
const menuAnalysisService = new MenuAnalysisService();

// POST /menu-analysis - Analyze menu image and provide budget recommendations (requires auth)
router.post(
  "/",
  authenticate,
  uploadImageMemory.single("image"),
  async (req, res) => {
    try {
      // Authentication is required - user is guaranteed to exist
      const userId = req.user.id;

      if (!req.file) {
        return handleError(createError.missingImage(), res);
      }

      const { budget, userNote = "" } = req.body;

      if (!budget || !Number.isFinite(Number(budget)) || Number(budget) <= 0) {
        return handleError(createError.invalidBudget(), res);
      }

      const imageBuffer = req.file.buffer;
      const imageMimeType = req.file.mimetype;

      // Check cache for same menu and budget
      if (
        menuAnalysisCache.hasSameMenu(imageBuffer) &&
        menuAnalysisCache.hasSameBudget(Number(budget))
      ) {
        const cached = menuAnalysisCache.getLastRecommendation();
        return res.status(200).json({
          message: "Cached recommendation",
          cached: true,
          menuInfo: cached.menuInfo,
          recommendation: cached.recommendation,
          timestamp: cached.ts,
        });
      }

      // Process the menu image
      const result = await menuAnalysisController.handleRecommend({
        imageBuffer,
        imageMimeType,
        budget: Number(budget),
        userNote,
        userId, // Pass userId for history tracking (required)
      });

      // Cache the result
      menuAnalysisCache.setLastRecommendation({
        imageBuffer,
        menuInfo: result.menuInfo,
        recommendation: result.recommendation,
        budget: Number(budget),
      });

      res.status(200).json({
        message: "Menu analysis completed successfully",
        cached: false,
        ...result,
      });
    } catch (error) {
      handleError(error, res);
    }
  }
);

// GET /menu-analysis/last - Get the last cached recommendation
router.get("/last", (req, res) => {
  try {
    const cached = menuAnalysisCache.getLastRecommendation();

    if (!cached) {
      return handleError(createError.noCache(), res);
    }

    res.status(200).json({
      message: "Last cached recommendation",
      menuInfo: cached.menuInfo,
      recommendation: cached.recommendation,
      budget: cached.budget,
      timestamp: cached.ts,
    });
  } catch (error) {
    handleError(error, res);
  }
});

// DELETE /menu-analysis/cache - Clear the cache
router.delete("/cache", (req, res) => {
  try {
    menuAnalysisCache.clear();
    res.status(200).json({
      message: "Cache cleared successfully",
    });
  } catch (error) {
    handleError(error, res);
  }
});

// ==================== USER-AWARE MENU ANALYSIS HISTORY ROUTES ====================

// GET /menu-analysis/history - Get user's menu analysis history (requires auth)
router.get("/history", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit, offset, includeUser } = req.query;

    const options = {
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0,
      includeUser: includeUser === "true",
    };

    const analyses = await menuAnalysisService.getAllMenuAnalyses(
      userId,
      options
    );

    res.status(200).json({
      message: "Menu analysis history retrieved successfully",
      analyses,
      count: analyses.length,
    });
  } catch (error) {
    handleError(error, res);
  }
});

// GET /menu-analysis/history/:id - Get specific menu analysis (requires auth)
router.get("/history/:id", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const analysisId = parseInt(req.params.id);

    if (isNaN(analysisId) || analysisId <= 0) {
      return handleError(createError.invalidId(), res);
    }

    const analysis = await menuAnalysisService.getMenuAnalysisById(
      userId,
      analysisId
    );

    if (!analysis) {
      return handleError(createError.notFound("Menu analysis not found"), res);
    }

    res.status(200).json({
      message: "Menu analysis retrieved successfully",
      analysis,
    });
  } catch (error) {
    handleError(error, res);
  }
});

// PUT /menu-analysis/history/:id - Update menu analysis (requires auth)
router.put("/history/:id", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const analysisId = parseInt(req.params.id);

    if (isNaN(analysisId) || analysisId <= 0) {
      return handleError(createError.invalidId(), res);
    }

    const { userNote, budget } = req.body;

    const updatedAnalysis = await menuAnalysisService.updateMenuAnalysis(
      userId,
      analysisId,
      {
        userNote,
        budget,
      }
    );

    res.status(200).json({
      message: "Menu analysis updated successfully",
      analysis: updatedAnalysis,
    });
  } catch (error) {
    if (
      error.message.includes("not found") ||
      error.message.includes("access denied")
    ) {
      return handleError(createError.notFound(error.message), res);
    }
    handleError(error, res);
  }
});

// DELETE /menu-analysis/history/:id - Delete menu analysis (requires auth)
router.delete("/history/:id", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const analysisId = parseInt(req.params.id);

    if (isNaN(analysisId) || analysisId <= 0) {
      return handleError(createError.invalidId(), res);
    }

    await menuAnalysisService.deleteMenuAnalysis(userId, analysisId);

    res.status(204).send();
  } catch (error) {
    if (
      error.message.includes("not found") ||
      error.message.includes("access denied")
    ) {
      return handleError(createError.notFound(error.message), res);
    }
    handleError(error, res);
  }
});

// GET /menu-analysis/stats - Get user's menu analysis statistics (requires auth)
router.get("/stats", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await menuAnalysisService.getMenuAnalysisStats(userId);

    res.status(200).json({
      message: "Menu analysis statistics retrieved successfully",
      stats,
    });
  } catch (error) {
    handleError(error, res);
  }
});

export default router;
