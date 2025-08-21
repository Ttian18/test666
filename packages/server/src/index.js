// Main application entry point
// This file exports all the main components of the application

// Models
export * from "./models/index.js";

// Services
export { default as OpenAIService } from "./services/ai/openaiService.js";
export { default as RecommendationService } from "./services/restaurant/recommendationService.js";
export { default as ZhongcaoService } from "./services/restaurant/zhongcaoService.js";
export { default as MenuAnalysisService } from "./services/restaurant/menuAnalysisService.js";
export { default as BudgetRecommendationService } from "./services/restaurant/budgetRecommendationService.js";
export { default as MenuAnalysisController } from "./services/restaurant/menuAnalysisController.js";

// Utils
export * from "./utils/auth/authUtils.js";
export * from "./utils/upload/uploadUtils.js";
export * from "./utils/validation/validationUtils.js";
export * from "./utils/cache/menuAnalysisCache.js";
export * from "./utils/errors/menuAnalysisErrors.js";

// Config
export { default as appConfig } from "./config/app.js";
export { default as databaseConfig } from "./config/database.js";
export { default as openaiConfig } from "./config/openai.js";

// Types
export * from "./types/auth.js";
export * from "./types/restaurant.js";
export * from "./types/transaction.js";

// Database client
export { default as prisma } from "./models/database/client.js";
