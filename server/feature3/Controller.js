import ServiceImage from "./ServiceImage.js";
import ServiceBudget from "./ServiceBudget.js";
import { createError } from "./errors.js";

export default class Controller {
  constructor({ imageService, budgetService } = {}) {
    this.imageService = imageService || new ServiceImage();
    this.budgetService = budgetService || new ServiceBudget();
  }

  /**
   * Step 1: send menu image to ServiceImage to extract structured info
   * Step 2: send extracted info + budget to ServiceBudget for recommendation
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
