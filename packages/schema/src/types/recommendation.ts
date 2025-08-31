import { z } from "zod";

// Structured output schema for restaurant recommendations
export const RecommendationSchema = z.object({
  name: z.string().describe("The restaurant name"),
  address: z.string().describe("The full street address of the restaurant"),
  phone: z
    .string()
    .optional()
    .default("")
    .describe("The restaurant's phone number"),
  website: z
    .string()
    .optional()
    .default("")
    .describe("The restaurant's website URL"),
  googleMapsLink: z
    .string()
    .optional()
    .default("")
    .describe(
      [
        "Google Maps link to the restaurant location.",
        "Use both the search query and the place id to construct the link.",
        "e.g., https://www.google.com/maps/search/?api=1&query=Some+Place&query_place_id=ChIJN1t_tDeuEmsRUsoyG83frY4",
      ].join(" ")
    ),
  googleMapsLinkDescription: z
    .string()
    .optional()
    .default("")
    .describe("Description for the Google Maps link"),
  reason: z
    .string()
    .describe("Why this restaurant is recommended based on user preferences"),
  recommendation: z
    .string()
    .describe("Specific recommendation or tip about this restaurant"),
  cuisine: z.string().optional().default("").describe("Type of cuisine served"),
  priceRange: z
    .string()
    .optional()
    .default("")
    .describe("Price range (e.g., $, $$, $$$, $$$$)"),
  rating: z.string().optional().default("").describe("Average rating if known"),
  hours: z.string().optional().default("").describe("Operating hours if known"),
  specialFeatures: z
    .string()
    .optional()
    .default("")
    .describe("Special features like outdoor seating, live music, etc."),
});

export const RecommendationsSchema = z.array(RecommendationSchema);

export const RecommendationsEnvelopeSchema = z.object({
  recommendations: RecommendationsSchema,
});

// TypeScript types derived from the schemas
export type Recommendation = z.infer<typeof RecommendationSchema>;
export type Recommendations = z.infer<typeof RecommendationsSchema>;
export type RecommendationsEnvelope = z.infer<
  typeof RecommendationsEnvelopeSchema
>;
