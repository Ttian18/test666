// Main application entry point
// This file exports all the main components of the application

// Models (will be enabled as we convert files)
// export * from "./models/index.js";

// Services (will be enabled as we convert files)
// export { default as OpenAIService } from "./services/ai/openaiService.js";
// export { default as RecommendationService } from "./services/restaurant/recommendationService.js";
// export * as ZhongcaoService from "./services/restaurant/zhongcao/index.js";
// export { default as MenuAnalysisService } from "./services/restaurant/menuAnalysisService.js";
// export { default as BudgetRecommendationService } from "./services/restaurant/budgetRecommendationService.js";
// export { default as MenuAnalysisController } from "./services/restaurant/menuAnalysisController.js";
// export * as InsightsService from "./services/insights/insightsService.js";

// Utils (converted)
export * from "./routes/middleware/auth.ts";
// export * from "./utils/upload/uploadUtils.js";
// export * from "./utils/validation/validationUtils.js";
// export * from "./utils/cache/menuAnalysisCache.js";
// export * from "./utils/errors/menuAnalysisErrors.js";

// Config
export { default as appConfig } from "./config/app.ts";
export { default as databaseConfig } from "./config/database.ts";
export { default as openaiConfig } from "./config/openai.ts";

// Types are now imported from the schema package

// Database client
export { default as prisma } from "./models/database/client.ts";
