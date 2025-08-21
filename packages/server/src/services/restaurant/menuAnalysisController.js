import MenuAnalysisService from "./menuAnalysisService.js";
import BudgetRecommendationService from "./budgetRecommendationService.js";
import { createError } from "../../utils/errors/menuAnalysisErrors.js";

export default class MenuAnalysisController {
  constructor({ imageService, budgetService } = {}) {
    this.imageService = imageService || new MenuAnalysisService();
    this.budgetService = budgetService || new BudgetRecommendationService();
  }

  /**
   * Step 1: send menu image to MenuAnalysisService to extract structured info
   * Step 2: send extracted info + budget to BudgetRecommendationService for recommendation
   */
  async handleRecommend({ imageBuffer, imageMimeType, budget, userNote = "" }) {
    if (!imageBuffer || !imageMimeType) {
      throw createError.missingImageBuffer();
    }
    if (!Number.isFinite(budget) || budget <= 0) {
      throw createError.invalidBudget();
    }

    const menuInfo = await this.imageService.extractMenuFromImage({
      imageBuffer,
      imageMimeType,
    });

    const recommendation = await this.budgetService.recommendDishes({
      menuInfo,
      budget,
      userNote,
    });

    return { menuInfo, recommendation };
  }
}
