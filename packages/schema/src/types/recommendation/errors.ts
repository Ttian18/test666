import { z } from "zod";

// Error response schema
export const RecommendationErrorResponseSchema = z.object({
  error: z.string(),
  code: z.string().optional(),
  details: z
    .array(
      z.object({
        field: z.string(),
        message: z.string(),
      })
    )
    .optional(),
});

// TypeScript types derived from the schemas
export type RecommendationErrorResponse = z.infer<
  typeof RecommendationErrorResponseSchema
>;
