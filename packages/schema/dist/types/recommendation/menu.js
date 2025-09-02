"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RebudgetRequestSchema = exports.MenuAnalysisResponseSchema = exports.MenuRecommendationSchema = exports.MenuInfoSchema = exports.MenuAnalysisRequestSchema = void 0;
const zod_1 = require("zod");
// Request schemas for menu analysis
exports.MenuAnalysisRequestSchema = zod_1.z.object({
    budget: zod_1.z.number().positive("Budget must be a positive number"),
    note: zod_1.z.string().optional(),
});
// Response schemas for menu analysis
exports.MenuInfoSchema = zod_1.z.object({
    restaurantName: zod_1.z.string().optional(),
    items: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string(),
        price: zod_1.z.number().positive(),
        description: zod_1.z.string().optional(),
    })),
    totalItems: zod_1.z.number(),
    averagePrice: zod_1.z.number(),
    priceRange: zod_1.z.object({
        min: zod_1.z.number(),
        max: zod_1.z.number(),
    }),
});
exports.MenuRecommendationSchema = zod_1.z.object({
    recommendedItems: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string(),
        price: zod_1.z.number(),
        reason: zod_1.z.string(),
    })),
    totalCost: zod_1.z.number(),
    remainingBudget: zod_1.z.number(),
    budgetUtilization: zod_1.z.number(),
    recommendations: zod_1.z.array(zod_1.z.string()),
});
exports.MenuAnalysisResponseSchema = zod_1.z.object({
    menuInfo: exports.MenuInfoSchema,
    recommendation: exports.MenuRecommendationSchema,
    cached: zod_1.z.boolean().optional(),
});
exports.RebudgetRequestSchema = zod_1.z.object({
    budget: zod_1.z.number().positive("Budget must be a positive number"),
    note: zod_1.z.string().optional(),
});
