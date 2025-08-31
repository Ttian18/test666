import { z } from "zod";
export declare const RegisterRequestSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    password: string;
}, {
    name: string;
    email: string;
    password: string;
}>;
export declare const LoginRequestSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const LogoutRequestSchema: z.ZodObject<{
    token: z.ZodString;
}, "strip", z.ZodTypeAny, {
    token: string;
}, {
    token: string;
}>;
export declare const LogoutResponseSchema: z.ZodObject<{
    message: z.ZodString;
    success: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    message: string;
    success: boolean;
}, {
    message: string;
    success: boolean;
}>;
export declare const AuthResponseSchema: z.ZodObject<{
    message: z.ZodString;
    userId: z.ZodNumber;
    token: z.ZodString;
    profileComplete: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    message: string;
    token: string;
    userId: number;
    profileComplete?: boolean | undefined;
}, {
    message: string;
    token: string;
    userId: number;
    profileComplete?: boolean | undefined;
}>;
export declare const RegisterResponseSchema: z.ZodObject<{
    message: z.ZodString;
    userId: z.ZodNumber;
    token: z.ZodString;
}, "strip", z.ZodTypeAny, {
    message: string;
    token: string;
    userId: number;
}, {
    message: string;
    token: string;
    userId: number;
}>;
export declare const LoginResponseSchema: z.ZodObject<{
    message: z.ZodString;
    userId: z.ZodNumber;
    token: z.ZodString;
    profileComplete: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    message: string;
    token: string;
    userId: number;
    profileComplete: boolean;
}, {
    message: string;
    token: string;
    userId: number;
    profileComplete: boolean;
}>;
export declare const UserDataSchema: z.ZodObject<{
    id: z.ZodNumber;
    email: z.ZodString;
    name: z.ZodNullable<z.ZodString>;
    profileComplete: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    name: string | null;
    email: string;
    profileComplete: boolean;
    id: number;
}, {
    name: string | null;
    email: string;
    profileComplete: boolean;
    id: number;
}>;
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type LogoutRequest = z.infer<typeof LogoutRequestSchema>;
export type LogoutResponse = z.infer<typeof LogoutResponseSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type UserData = z.infer<typeof UserDataSchema>;
