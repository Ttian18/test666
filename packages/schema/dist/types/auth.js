"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserDataSchema = exports.LoginResponseSchema = exports.RegisterResponseSchema = exports.AuthResponseSchema = exports.LogoutResponseSchema = exports.LogoutRequestSchema = exports.LoginRequestSchema = exports.RegisterRequestSchema = void 0;
const zod_1 = require("zod");
// Register request schema
exports.RegisterRequestSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email format"),
    password: zod_1.z.string().min(8, "Password must be at least 8 characters"),
    name: zod_1.z
        .string()
        .min(1, "Name is required")
        .max(100, "Name must be less than 100 characters"),
});
// Login request schema
exports.LoginRequestSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email format"),
    password: zod_1.z.string().min(1, "Password is required"),
});
// Logout request schema
exports.LogoutRequestSchema = zod_1.z.object({
    token: zod_1.z.string().min(1, "Token is required"),
});
// Logout response schema
exports.LogoutResponseSchema = zod_1.z.object({
    message: zod_1.z.string(),
    success: zod_1.z.boolean(),
});
// Auth response schema
exports.AuthResponseSchema = zod_1.z.object({
    message: zod_1.z.string(),
    userId: zod_1.z.number(),
    token: zod_1.z.string(),
    profileComplete: zod_1.z.boolean().optional(),
});
// Register response schema
exports.RegisterResponseSchema = zod_1.z.object({
    message: zod_1.z.string(),
    userId: zod_1.z.number(),
    token: zod_1.z.string(),
});
// Login response schema
exports.LoginResponseSchema = zod_1.z.object({
    message: zod_1.z.string(),
    userId: zod_1.z.number(),
    token: zod_1.z.string(),
    profileComplete: zod_1.z.boolean(),
});
// User data schema (for profile and other user-related responses)
exports.UserDataSchema = zod_1.z.object({
    id: zod_1.z.number(),
    email: zod_1.z.string().email(),
    name: zod_1.z.string().nullable(),
    profileComplete: zod_1.z.boolean(),
});
