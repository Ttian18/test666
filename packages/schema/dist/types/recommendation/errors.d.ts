import { z } from "zod";
export declare const RecommendationErrorResponseSchema: z.ZodObject<{
    error: z.ZodString;
    code: z.ZodOptional<z.ZodString>;
    details: z.ZodOptional<z.ZodArray<z.ZodObject<{
        field: z.ZodString;
        message: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        message: string;
        field: string;
    }, {
        message: string;
        field: string;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    error: string;
    code?: string | undefined;
    details?: {
        message: string;
        field: string;
    }[] | undefined;
}, {
    error: string;
    code?: string | undefined;
    details?: {
        message: string;
        field: string;
    }[] | undefined;
}>;
export type RecommendationErrorResponse = z.infer<typeof RecommendationErrorResponseSchema>;
