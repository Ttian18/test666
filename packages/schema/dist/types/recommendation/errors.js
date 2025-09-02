"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendationErrorResponseSchema = void 0;
const zod_1 = require("zod");
// Error response schema
exports.RecommendationErrorResponseSchema = zod_1.z.object({
    error: zod_1.z.string(),
    code: zod_1.z.string().optional(),
    details: zod_1.z
        .array(zod_1.z.object({
        field: zod_1.z.string(),
        message: zod_1.z.string(),
    }))
        .optional(),
});
