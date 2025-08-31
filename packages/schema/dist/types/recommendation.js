"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendationsEnvelopeSchema = exports.RecommendationsSchema = exports.RecommendationSchema = void 0;
const zod_1 = require("zod");
// Structured output schema for restaurant recommendations
exports.RecommendationSchema = zod_1.z.object({
    name: zod_1.z.string().describe("The restaurant name"),
    address: zod_1.z.string().describe("The full street address of the restaurant"),
    phone: zod_1.z
        .string()
        .optional()
        .default("")
        .describe("The restaurant's phone number"),
    website: zod_1.z
        .string()
        .optional()
        .default("")
        .describe("The restaurant's website URL"),
    googleMapsLink: zod_1.z
        .string()
        .optional()
        .default("")
        .describe([
        "Google Maps link to the restaurant location.",
        "Use both the search query and the place id to construct the link.",
        "e.g., https://www.google.com/maps/search/?api=1&query=Some+Place&query_place_id=ChIJN1t_tDeuEmsRUsoyG83frY4",
    ].join(" ")),
    googleMapsLinkDescription: zod_1.z
        .string()
        .optional()
        .default("")
        .describe("Description for the Google Maps link"),
    reason: zod_1.z
        .string()
        .describe("Why this restaurant is recommended based on user preferences"),
    recommendation: zod_1.z
        .string()
        .describe("Specific recommendation or tip about this restaurant"),
    cuisine: zod_1.z.string().optional().default("").describe("Type of cuisine served"),
    priceRange: zod_1.z
        .string()
        .optional()
        .default("")
        .describe("Price range (e.g., $, $$, $$$, $$$$)"),
    rating: zod_1.z.string().optional().default("").describe("Average rating if known"),
    hours: zod_1.z.string().optional().default("").describe("Operating hours if known"),
    specialFeatures: zod_1.z
        .string()
        .optional()
        .default("")
        .describe("Special features like outdoor seating, live music, etc."),
});
exports.RecommendationsSchema = zod_1.z.array(exports.RecommendationSchema);
exports.RecommendationsEnvelopeSchema = zod_1.z.object({
    recommendations: exports.RecommendationsSchema,
});
