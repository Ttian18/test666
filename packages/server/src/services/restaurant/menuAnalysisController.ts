import MenuAnalysisService from "./menuAnalysisService.ts";
import BudgetRecommendationService from "./budgetRecommendationService.ts";
import { createError } from "../../utils/errors/menuAnalysisErrors.ts";

export default class MenuAnalysisController {
  private imageService: MenuAnalysisService;
  private budgetService: BudgetRecommendationService;

  constructor({
    imageService,
    budgetService,
  }: {
    imageService?: MenuAnalysisService;
    budgetService?: BudgetRecommendationService;
  } = {}) {
    this.imageService = imageService || new MenuAnalysisService();
    this.budgetService = budgetService || new BudgetRecommendationService();
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
    userId = null,
  }: {
    imageBuffer: Buffer;
    imageMimeType: string;
    budget: number;
    userNote?: string;
    userId?: number | null;
  }) {
    if (!imageBuffer || !imageMimeType) {
      throw createError.missingImageBuffer();
    }
    if (!Number.isFinite(budget) || budget <= 0) {
      throw createError.invalidBudget();
    }

    const menuInfo = await this.imageService.extractMenuFromImage({
      imageBuffer,
      imageMimeType,
      userId,
      budget,
      userNote,
    });

    const recommendation = await this.budgetService.recommendDishes({
      menuInfo,
      budget,
      userNote,
    });

    return { menuInfo, recommendation };
  }
}
