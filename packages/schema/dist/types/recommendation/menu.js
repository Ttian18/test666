import { z } from "zod";
// Request schemas for menu analysis
export const MenuAnalysisRequestSchema = z.object({
    budget: z.number().positive("Budget must be a positive number"),
    note: z.string().optional(),
});
// Response schemas for menu analysis
export const MenuInfoSchema = z.object({
    restaurantName: z.string().optional(),
    items: z.array(z.object({
        name: z.string(),
        price: z.number().positive(),
        description: z.string().optional(),
    })),
    totalItems: z.number(),
    averagePrice: z.number(),
    priceRange: z.object({
        min: z.number(),
        max: z.number(),
    }),
});
export const MenuRecommendationSchema = z.object({
    recommendedItems: z.array(z.object({
        name: z.string(),
        price: z.number(),
        reason: z.string(),
    })),
    totalCost: z.number(),
    remainingBudget: z.number(),
    budgetUtilization: z.number(),
    recommendations: z.array(z.string()),
});
export const MenuAnalysisResponseSchema = z.object({
    menuInfo: MenuInfoSchema,
    recommendation: MenuRecommendationSchema,
    cached: z.boolean().optional(),
});
export const RebudgetRequestSchema = z.object({
    budget: z.number().positive("Budget must be a positive number"),
    note: z.string().optional(),
});
