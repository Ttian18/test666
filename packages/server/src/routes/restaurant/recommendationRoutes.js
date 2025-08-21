import express from "express";
import MenuAnalysisController from "../../services/restaurant/menuAnalysisController.js";
import {
  createError,
  handleError,
} from "../../utils/errors/menuAnalysisErrors.js";
import menuAnalysisCache from "../../utils/cache/menuAnalysisCache.js";
import { uploadImageMemory } from "../../utils/upload/uploadUtils.js";
import { validateBudget } from "../../utils/validation/validationUtils.js";

const router = express.Router();

// Health check
router.get("/health", (_req, res) => {
  res.json({ ok: true });
});

// Route: accepts multipart form-data with fields: image (file), budget (text/number)
router.post(
  "/recommend",
  uploadImageMemory.single("image"),
  async (req, res) => {
    try {
      const budgetRaw = req.body?.budget;
      const budget = budgetRaw !== undefined ? Number(budgetRaw) : undefined;

      if (!req.file) {
        throw createError.missingImage();
      }

      // Validate mime type - only allow jpg, png, webp
      const validMimeTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];
      if (!validMimeTypes.includes(req.file.mimetype)) {
        throw createError.invalidMimeType();
      }

      // Validate image size - 6MB limit
      const maxSizeBytes = 6 * 1024 * 1024; // 6MB
      if (req.file.size > maxSizeBytes) {
        throw createError.imageTooLarge();
      }

      if (!Number.isFinite(budget) || budget <= 0) {
        throw createError.invalidBudget();
      }

      const recommender = new MenuAnalysisController();
      let result;

      // Check cache logic
      if (menuAnalysisCache.hasSameMenu(req.file.buffer)) {
        // Same menu, check if budget is also the same
        if (menuAnalysisCache.hasSameBudget(budget)) {
          // Both menu and budget are the same, return cached result
          const cached = menuAnalysisCache.getLastRecommendation();
          return res.json({
            menuInfo: cached.menuInfo,
            recommendation: cached.recommendation,
            cached: true,
          });
        } else {
          // Same menu, different budget - reuse menuInfo, only run recommendation
          const cachedMenuInfo = menuAnalysisCache.getCachedMenuInfo();
          const recommendation =
            await recommender.budgetService.recommendDishes({
              menuInfo: cachedMenuInfo,
              budget,
              userNote: req.body?.note || "",
            });

          result = {
            menuInfo: cachedMenuInfo,
            recommendation,
          };
        }
      } else {
        // Different menu or no cache - run full extraction + recommendation
        result = await recommender.handleRecommend({
          imageBuffer: req.file.buffer,
          imageMimeType: req.file.mimetype,
          budget,
          userNote: req.body?.note || "",
        });
      }

      // Store successful recommendation in cache
      menuAnalysisCache.setLastRecommendation({
        imageBuffer: req.file.buffer,
        menuInfo: result.menuInfo,
        recommendation: result.recommendation,
        budget,
      });

      res.json(result);
    } catch (error) {
      handleError(error, res);
    }
  }
);

// Route: get the last recommendation from cache
router.get("/last", (req, res) => {
  const lastRecommendation = menuAnalysisCache.getLastRecommendation();

  if (menuAnalysisCache.isEmpty()) {
    return res.status(404).json({
      error: "No previous recommendation found",
      code: "NO_CACHED_RECOMMENDATION",
    });
  }

  res.json(lastRecommendation);
});

// Route: rebudget using cached menu info
router.post("/rebudget", async (req, res) => {
  try {
    const { budget } = req.body;

    if (!Number.isFinite(budget) || budget <= 0) {
      throw createError.invalidBudget();
    }

    if (menuAnalysisCache.isEmpty()) {
      throw createError.noCache();
    }

    const cachedMenuInfo = menuAnalysisCache.getCachedMenuInfo();
    if (!cachedMenuInfo) {
      throw createError.noCache();
    }

    const recommender = new MenuAnalysisController();
    const recommendation = await recommender.budgetService.recommendDishes({
      menuInfo: cachedMenuInfo,
      budget,
      userNote: req.body?.note || "",
    });

    // Update cache with new recommendation
    const currentCache = menuAnalysisCache.getLastRecommendation();
    menuAnalysisCache.setLastRecommendation({
      imageBuffer: null, // We don't have the image buffer in this endpoint
      menuInfo: cachedMenuInfo,
      recommendation,
      budget,
    });

    res.json({
      menuInfo: cachedMenuInfo,
      recommendation,
    });
  } catch (error) {
    handleError(error, res);
  }
});

export default router;
