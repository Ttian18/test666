import { z } from "zod";

// Register request schema
export const RegisterRequestSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be less than 50 characters")
    .regex(
      /^[a-zA-Z\s'-]+$/,
      "First name can only contain letters, spaces, hyphens, and apostrophes"
    ),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be less than 50 characters")
    .regex(
      /^[a-zA-Z\s'-]+$/,
      "Last name can only contain letters, spaces, hyphens, and apostrophes"
    ),
});

// Login request schema
export const LoginRequestSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

// Logout request schema
export const LogoutRequestSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

// Logout response schema
export const LogoutResponseSchema = z.object({
  message: z.string(),
  success: z.boolean(),
});

// Auth response schema
export const AuthResponseSchema = z.object({
  message: z.string(),
  userId: z.number(),
  token: z.string(),
  profileComplete: z.boolean().optional(),
});

// Register response schema
export const RegisterResponseSchema = z.object({
  message: z.string(),
  userId: z.number(),
  token: z.string(),
});

// Login response schema
export const LoginResponseSchema = z.object({
  message: z.string(),
  userId: z.number(),
  token: z.string(),
  profileComplete: z.boolean(),
  name: z.string().nullable(),
});

// User data schema (for profile and other user-related responses)
export const UserDataSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string().nullable(),
  profileComplete: z.boolean(),
});

// TypeScript types (inferred from schemas)
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type LogoutRequest = z.infer<typeof LogoutRequestSchema>;
export type LogoutResponse = z.infer<typeof LogoutResponseSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type UserData = z.infer<typeof UserDataSchema>;
