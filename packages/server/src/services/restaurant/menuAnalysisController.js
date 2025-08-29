import MenuAnalysisService from "./menuAnalysisService.js";
import BudgetRecommendationService from "./budgetRecommendationService.js";
import { createError } from "../../utils/errors/menuAnalysisErrors.js";
import { applyHardFilter } from "./tagHardFilter.js";
import { rankDishesWithLLM } from "./llmMenuRanker.js";
import { normalizeTags, tagsHash } from "../../utils/tagsUtils.js";
import { normalizeCalories } from "../../utils/caloriesUtils.js";

export default class MenuAnalysisController {
  constructor() {
    this.menuAnalysisService = new MenuAnalysisService();
    this.budgetService = new BudgetRecommendationService();
  }

  /**
   * Step 1: send menu image to MenuAnalysisService to extract structured info
   * Step 2: send extracted info + budget to BudgetRecommendationService for recommendation
   */
  async handleRecommend({
    imageBuffer,
    imageMimeType,
    budget,
    userNote = "",
    tags,
    calories,
    menuInfo: providedMenuInfo,
  }) {
    if (!Number.isFinite(budget) || budget <= 0) {
      throw createError.invalidBudget();
    }

    let menuInfo;

    if (imageBuffer && imageMimeType) {
      // Extract menu from image
      const analysisResult =
        await this.menuAnalysisService.extractMenuFromImage({
          imageBuffer,
          imageMimeType,
        });
      menuInfo = analysisResult;
    } else if (providedMenuInfo) {
      // Use provided menu info (for rebudget flow)
      menuInfo = providedMenuInfo;
    } else {
      throw createError.missingImageBuffer();
    }

    // Normalize calories
    const normalizedCalories = normalizeCalories(calories);

    // Handle tags if provided
    if (tags && Array.isArray(tags) && tags.length > 0) {
      const normalizedTags = normalizeTags(tags);
      const tagsSig = tagsHash(normalizedTags);

      // Apply hard filter with new dynamic negative support
      const { allowedItems, removedCount, debug, hardCore, negKeys, soft } =
        applyHardFilter(menuInfo, normalizedTags);

      // Build hard constraints and soft preferences for LLM
      const hardConstraints = [...hardCore, ...negKeys.map((k) => `no:${k}`)];
      const softPreferences = soft;

      try {
        // Try LLM ranking with hard constraints and soft preferences
        const plan = await rankDishesWithLLM({
          items: allowedItems,
          budget,
          tags: normalizedTags,
          hardConstraints,
          softPreferences,
          calories: normalizedCalories,
        });

        // Build response with LLM results
        return {
          menuInfo: { ...menuInfo, items: allowedItems },
          recommendation: {
            picks: plan.picks,
            estimatedTotal: plan.estTotal,
            estimatedTotalCalories: plan.estimatedTotalCalories,
            notes: plan.notes,
            filteredOut: plan.filteredOut,
            relaxedHard: plan.relaxedHard,
          },
          tagsApplied: normalizedTags,
          hardConstraints,
          softPreferences,
          caloriesApplied: normalizedCalories,
          removedByTags: removedCount,
          filterDebug: debug,
          guardViolations: plan.guardViolations || [],
        };
      } catch (llmError) {
        console.warn("LLM ranking failed, using fallback:", llmError.message);

        // Fallback to previous budget service
        const recommendation = await this.budgetService.recommendDishes({
          menuInfo: { ...menuInfo, items: allowedItems },
          budget,
          userNote,
          calories: normalizedCalories,
        });

        return {
          menuInfo: { ...menuInfo, items: allowedItems },
          recommendation: {
            ...recommendation,
            notes: "LLM unavailable; used fallback",
          },
          tagsApplied: normalizedTags,
          hardConstraints,
          softPreferences,
          caloriesApplied: normalizedCalories,
          removedByTags: removedCount,
          filterDebug: debug,
          guardViolations: [],
        };
      }
    } else {
      // No tags - use original flow
      const recommendation = await this.budgetService.recommendDishes({
        menuInfo,
        budget,
        userNote,
        calories: normalizedCalories,
      });

      return {
        menuInfo,
        recommendation,
        caloriesApplied: normalizedCalories,
      };
    }
  }
}
