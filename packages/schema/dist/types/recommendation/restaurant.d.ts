import { z } from "zod";
export declare const RecommendationSchema: z.ZodObject<{
    name: z.ZodString;
    address: z.ZodString;
    phone: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    website: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    googleMapsLink: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    googleMapsLinkDescription: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    reason: z.ZodString;
    recommendation: z.ZodString;
    cuisine: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    priceRange: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    rating: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    hours: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    specialFeatures: z.ZodDefault<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    address: string;
    phone: string;
    website: string;
    googleMapsLink: string;
    googleMapsLinkDescription: string;
    reason: string;
    recommendation: string;
    cuisine: string;
    priceRange: string;
    rating: string;
    hours: string;
    specialFeatures: string;
}, {
    name: string;
    address: string;
    reason: string;
    recommendation: string;
    phone?: string | undefined;
    website?: string | undefined;
    googleMapsLink?: string | undefined;
    googleMapsLinkDescription?: string | undefined;
    cuisine?: string | undefined;
    priceRange?: string | undefined;
    rating?: string | undefined;
    hours?: string | undefined;
    specialFeatures?: string | undefined;
}>;
export declare const RecommendationsSchema: z.ZodArray<z.ZodObject<{
    name: z.ZodString;
    address: z.ZodString;
    phone: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    website: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    googleMapsLink: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    googleMapsLinkDescription: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    reason: z.ZodString;
    recommendation: z.ZodString;
    cuisine: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    priceRange: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    rating: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    hours: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    specialFeatures: z.ZodDefault<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    address: string;
    phone: string;
    website: string;
    googleMapsLink: string;
    googleMapsLinkDescription: string;
    reason: string;
    recommendation: string;
    cuisine: string;
    priceRange: string;
    rating: string;
    hours: string;
    specialFeatures: string;
}, {
    name: string;
    address: string;
    reason: string;
    recommendation: string;
    phone?: string | undefined;
    website?: string | undefined;
    googleMapsLink?: string | undefined;
    googleMapsLinkDescription?: string | undefined;
    cuisine?: string | undefined;
    priceRange?: string | undefined;
    rating?: string | undefined;
    hours?: string | undefined;
    specialFeatures?: string | undefined;
}>, "many">;
export declare const RecommendationsEnvelopeSchema: z.ZodObject<{
    recommendations: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        address: z.ZodString;
        phone: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        website: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        googleMapsLink: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        googleMapsLinkDescription: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        reason: z.ZodString;
        recommendation: z.ZodString;
        cuisine: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        priceRange: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        rating: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        hours: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        specialFeatures: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        address: string;
        phone: string;
        website: string;
        googleMapsLink: string;
        googleMapsLinkDescription: string;
        reason: string;
        recommendation: string;
        cuisine: string;
        priceRange: string;
        rating: string;
        hours: string;
        specialFeatures: string;
    }, {
        name: string;
        address: string;
        reason: string;
        recommendation: string;
        phone?: string | undefined;
        website?: string | undefined;
        googleMapsLink?: string | undefined;
        googleMapsLinkDescription?: string | undefined;
        cuisine?: string | undefined;
        priceRange?: string | undefined;
        rating?: string | undefined;
        hours?: string | undefined;
        specialFeatures?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    recommendations: {
        name: string;
        address: string;
        phone: string;
        website: string;
        googleMapsLink: string;
        googleMapsLinkDescription: string;
        reason: string;
        recommendation: string;
        cuisine: string;
        priceRange: string;
        rating: string;
        hours: string;
        specialFeatures: string;
    }[];
}, {
    recommendations: {
        name: string;
        address: string;
        reason: string;
        recommendation: string;
        phone?: string | undefined;
        website?: string | undefined;
        googleMapsLink?: string | undefined;
        googleMapsLinkDescription?: string | undefined;
        cuisine?: string | undefined;
        priceRange?: string | undefined;
        rating?: string | undefined;
        hours?: string | undefined;
        specialFeatures?: string | undefined;
    }[];
}>;
export declare const GetRestaurantRecommendationsRequestSchema: z.ZodObject<{
    query: z.ZodString;
    userData: z.ZodOptional<z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        email: z.ZodOptional<z.ZodString>;
        monthlyBudget: z.ZodOptional<z.ZodNumber>;
        monthlyIncome: z.ZodOptional<z.ZodNumber>;
        expensePreferences: z.ZodOptional<z.ZodObject<{
            diningOut: z.ZodOptional<z.ZodString>;
            cuisineTypes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            diningOut?: string | undefined;
            cuisineTypes?: string[] | undefined;
        }, {
            diningOut?: string | undefined;
            cuisineTypes?: string[] | undefined;
        }>>;
        savingsGoals: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        lifestylePreferences: z.ZodOptional<z.ZodObject<{
            diningStyle: z.ZodOptional<z.ZodString>;
            priceRange: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            priceRange?: string | undefined;
            diningStyle?: string | undefined;
        }, {
            priceRange?: string | undefined;
            diningStyle?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        name?: string | undefined;
        email?: string | undefined;
        monthlyBudget?: number | undefined;
        monthlyIncome?: number | undefined;
        expensePreferences?: {
            diningOut?: string | undefined;
            cuisineTypes?: string[] | undefined;
        } | undefined;
        savingsGoals?: Record<string, any> | undefined;
        lifestylePreferences?: {
            priceRange?: string | undefined;
            diningStyle?: string | undefined;
        } | undefined;
    }, {
        name?: string | undefined;
        email?: string | undefined;
        monthlyBudget?: number | undefined;
        monthlyIncome?: number | undefined;
        expensePreferences?: {
            diningOut?: string | undefined;
            cuisineTypes?: string[] | undefined;
        } | undefined;
        savingsGoals?: Record<string, any> | undefined;
        lifestylePreferences?: {
            priceRange?: string | undefined;
            diningStyle?: string | undefined;
        } | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    query: string;
    userData?: {
        name?: string | undefined;
        email?: string | undefined;
        monthlyBudget?: number | undefined;
        monthlyIncome?: number | undefined;
        expensePreferences?: {
            diningOut?: string | undefined;
            cuisineTypes?: string[] | undefined;
        } | undefined;
        savingsGoals?: Record<string, any> | undefined;
        lifestylePreferences?: {
            priceRange?: string | undefined;
            diningStyle?: string | undefined;
        } | undefined;
    } | undefined;
}, {
    query: string;
    userData?: {
        name?: string | undefined;
        email?: string | undefined;
        monthlyBudget?: number | undefined;
        monthlyIncome?: number | undefined;
        expensePreferences?: {
            diningOut?: string | undefined;
            cuisineTypes?: string[] | undefined;
        } | undefined;
        savingsGoals?: Record<string, any> | undefined;
        lifestylePreferences?: {
            priceRange?: string | undefined;
            diningStyle?: string | undefined;
        } | undefined;
    } | undefined;
}>;
export declare const GetRestaurantRecommendationsResponseSchema: z.ZodObject<{
    query: z.ZodString;
    answer: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        address: z.ZodString;
        phone: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        website: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        googleMapsLink: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        googleMapsLinkDescription: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        reason: z.ZodString;
        recommendation: z.ZodString;
        cuisine: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        priceRange: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        rating: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        hours: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        specialFeatures: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        address: string;
        phone: string;
        website: string;
        googleMapsLink: string;
        googleMapsLinkDescription: string;
        reason: string;
        recommendation: string;
        cuisine: string;
        priceRange: string;
        rating: string;
        hours: string;
        specialFeatures: string;
    }, {
        name: string;
        address: string;
        reason: string;
        recommendation: string;
        phone?: string | undefined;
        website?: string | undefined;
        googleMapsLink?: string | undefined;
        googleMapsLinkDescription?: string | undefined;
        cuisine?: string | undefined;
        priceRange?: string | undefined;
        rating?: string | undefined;
        hours?: string | undefined;
        specialFeatures?: string | undefined;
    }>, "many">;
    rawAnswer: z.ZodString;
}, "strip", z.ZodTypeAny, {
    query: string;
    answer: {
        name: string;
        address: string;
        phone: string;
        website: string;
        googleMapsLink: string;
        googleMapsLinkDescription: string;
        reason: string;
        recommendation: string;
        cuisine: string;
        priceRange: string;
        rating: string;
        hours: string;
        specialFeatures: string;
    }[];
    rawAnswer: string;
}, {
    query: string;
    answer: {
        name: string;
        address: string;
        reason: string;
        recommendation: string;
        phone?: string | undefined;
        website?: string | undefined;
        googleMapsLink?: string | undefined;
        googleMapsLinkDescription?: string | undefined;
        cuisine?: string | undefined;
        priceRange?: string | undefined;
        rating?: string | undefined;
        hours?: string | undefined;
        specialFeatures?: string | undefined;
    }[];
    rawAnswer: string;
}>;
export type Recommendation = z.infer<typeof RecommendationSchema>;
export type Recommendations = z.infer<typeof RecommendationsSchema>;
export type RecommendationsEnvelope = z.infer<typeof RecommendationsEnvelopeSchema>;
export type GetRestaurantRecommendationsRequest = z.infer<typeof GetRestaurantRecommendationsRequestSchema>;
export type GetRestaurantRecommendationsResponse = z.infer<typeof GetRestaurantRecommendationsResponseSchema>;
