// Main application entry point
// This file exports all the main components of the application

// Models (converted)
export * from "./models/index.ts";

// Services (converted)
export { default as OpenAIService } from "./services/ai/openaiService.ts";
export * as RecommendationService from "./services/restaurant/recommendationService.ts";
export * as ZhongcaoService from "./services/restaurant/zhongcao/index.ts";
export { default as MenuAnalysisService } from "./services/restaurant/menuAnalysisService.ts";
export { default as BudgetRecommendationService } from "./services/restaurant/budgetRecommendationService.ts";
export { default as MenuAnalysisController } from "./services/restaurant/menuAnalysisController.ts";
export * as InsightsService from "./services/insights/insightsService.ts";

// Utils (converted)
export * from "./routes/middleware/auth.ts";
export * from "./utils/upload/uploadUtils.ts";
export * from "./utils/validation/validationUtils.ts";
export * from "./utils/cache/menuAnalysisCache.ts";
export * from "./utils/errors/menuAnalysisErrors.ts";

// Config
export { default as appConfig } from "./config/app.ts";
export { default as databaseConfig } from "./config/database.ts";
export { default as openaiConfig } from "./config/openai.ts";

// Types are now imported from the schema package

// Database client
export { default as prisma } from "./models/database/client.ts";
