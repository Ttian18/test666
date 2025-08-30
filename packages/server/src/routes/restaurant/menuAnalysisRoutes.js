import express from "express";
import MenuAnalysisController from "../../services/restaurant/menuAnalysisController.js";
import {
  handleError,
  createError,
} from "../../utils/errors/menuAnalysisErrors.js";
import menuAnalysisCache from "../../utils/cache/menuAnalysisCache.js";
import { uploadImageMemory } from "../../utils/upload/uploadUtils.js";
import { validateBudget } from "../../utils/validation/validationUtils.js";
import { optionalAuthenticate } from "../../services/auth/authUtils.js";

const router = express.Router();

// Initialize controller
const menuAnalysisController = new MenuAnalysisController();

// POST /menu-analysis - Analyze menu image and provide budget recommendations (optional auth)
router.post("/", uploadImageMemory.single("image"), async (req, res) => {
  try {
    // Check for optional authentication
    const token = req.header("x-auth-token");
    const user = await optionalAuthenticate(token);
    const userId = user ? user.id : null;

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
});

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

export default router;
