import { z } from "zod";
export declare const MenuAnalysisRequestSchema: z.ZodObject<{
    budget: z.ZodNumber;
    note: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    budget: number;
    note?: string | undefined;
}, {
    budget: number;
    note?: string | undefined;
}>;
export declare const MenuInfoSchema: z.ZodObject<{
    restaurantName: z.ZodOptional<z.ZodString>;
    items: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        price: z.ZodNumber;
        description: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        price: number;
        description?: string | undefined;
    }, {
        name: string;
        price: number;
        description?: string | undefined;
    }>, "many">;
    totalItems: z.ZodNumber;
    averagePrice: z.ZodNumber;
    priceRange: z.ZodObject<{
        min: z.ZodNumber;
        max: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        min: number;
        max: number;
    }, {
        min: number;
        max: number;
    }>;
}, "strip", z.ZodTypeAny, {
    priceRange: {
        min: number;
        max: number;
    };
    items: {
        name: string;
        price: number;
        description?: string | undefined;
    }[];
    totalItems: number;
    averagePrice: number;
    restaurantName?: string | undefined;
}, {
    priceRange: {
        min: number;
        max: number;
    };
    items: {
        name: string;
        price: number;
        description?: string | undefined;
    }[];
    totalItems: number;
    averagePrice: number;
    restaurantName?: string | undefined;
}>;
export declare const MenuRecommendationSchema: z.ZodObject<{
    recommendedItems: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        price: z.ZodNumber;
        reason: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        reason: string;
        price: number;
    }, {
        name: string;
        reason: string;
        price: number;
    }>, "many">;
    totalCost: z.ZodNumber;
    remainingBudget: z.ZodNumber;
    budgetUtilization: z.ZodNumber;
    recommendations: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    recommendations: string[];
    recommendedItems: {
        name: string;
        reason: string;
        price: number;
    }[];
    totalCost: number;
    remainingBudget: number;
    budgetUtilization: number;
}, {
    recommendations: string[];
    recommendedItems: {
        name: string;
        reason: string;
        price: number;
    }[];
    totalCost: number;
    remainingBudget: number;
    budgetUtilization: number;
}>;
export declare const MenuAnalysisResponseSchema: z.ZodObject<{
    menuInfo: z.ZodObject<{
        restaurantName: z.ZodOptional<z.ZodString>;
        items: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            price: z.ZodNumber;
            description: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            price: number;
            description?: string | undefined;
        }, {
            name: string;
            price: number;
            description?: string | undefined;
        }>, "many">;
        totalItems: z.ZodNumber;
        averagePrice: z.ZodNumber;
        priceRange: z.ZodObject<{
            min: z.ZodNumber;
            max: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            min: number;
            max: number;
        }, {
            min: number;
            max: number;
        }>;
    }, "strip", z.ZodTypeAny, {
        priceRange: {
            min: number;
            max: number;
        };
        items: {
            name: string;
            price: number;
            description?: string | undefined;
        }[];
        totalItems: number;
        averagePrice: number;
        restaurantName?: string | undefined;
    }, {
        priceRange: {
            min: number;
            max: number;
        };
        items: {
            name: string;
            price: number;
            description?: string | undefined;
        }[];
        totalItems: number;
        averagePrice: number;
        restaurantName?: string | undefined;
    }>;
    recommendation: z.ZodObject<{
        recommendedItems: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            price: z.ZodNumber;
            reason: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            name: string;
            reason: string;
            price: number;
        }, {
            name: string;
            reason: string;
            price: number;
        }>, "many">;
        totalCost: z.ZodNumber;
        remainingBudget: z.ZodNumber;
        budgetUtilization: z.ZodNumber;
        recommendations: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        recommendations: string[];
        recommendedItems: {
            name: string;
            reason: string;
            price: number;
        }[];
        totalCost: number;
        remainingBudget: number;
        budgetUtilization: number;
    }, {
        recommendations: string[];
        recommendedItems: {
            name: string;
            reason: string;
            price: number;
        }[];
        totalCost: number;
        remainingBudget: number;
        budgetUtilization: number;
    }>;
    cached: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    recommendation: {
        recommendations: string[];
        recommendedItems: {
            name: string;
            reason: string;
            price: number;
        }[];
        totalCost: number;
        remainingBudget: number;
        budgetUtilization: number;
    };
    menuInfo: {
        priceRange: {
            min: number;
            max: number;
        };
        items: {
            name: string;
            price: number;
            description?: string | undefined;
        }[];
        totalItems: number;
        averagePrice: number;
        restaurantName?: string | undefined;
    };
    cached?: boolean | undefined;
}, {
    recommendation: {
        recommendations: string[];
        recommendedItems: {
            name: string;
            reason: string;
            price: number;
        }[];
        totalCost: number;
        remainingBudget: number;
        budgetUtilization: number;
    };
    menuInfo: {
        priceRange: {
            min: number;
            max: number;
        };
        items: {
            name: string;
            price: number;
            description?: string | undefined;
        }[];
        totalItems: number;
        averagePrice: number;
        restaurantName?: string | undefined;
    };
    cached?: boolean | undefined;
}>;
export declare const RebudgetRequestSchema: z.ZodObject<{
    budget: z.ZodNumber;
    note: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    budget: number;
    note?: string | undefined;
}, {
    budget: number;
    note?: string | undefined;
}>;
export type MenuAnalysisRequest = z.infer<typeof MenuAnalysisRequestSchema>;
export type MenuAnalysisResponse = z.infer<typeof MenuAnalysisResponseSchema>;
export type RebudgetRequest = z.infer<typeof RebudgetRequestSchema>;
export type MenuInfo = z.infer<typeof MenuInfoSchema>;
export type MenuRecommendation = z.infer<typeof MenuRecommendationSchema>;
