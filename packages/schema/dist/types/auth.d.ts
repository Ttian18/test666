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
export declare const AuthResponseSchema: z.ZodObject<{
    message: z.ZodString;
    userId: z.ZodNumber;
    token: z.ZodString;
    profileComplete: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    message: string;
    userId: number;
    token: string;
    profileComplete?: boolean | undefined;
}, {
    message: string;
    userId: number;
    token: string;
    profileComplete?: boolean | undefined;
}>;
export declare const RegisterResponseSchema: z.ZodObject<{
    message: z.ZodString;
    userId: z.ZodNumber;
    token: z.ZodString;
}, "strip", z.ZodTypeAny, {
    message: string;
    userId: number;
    token: string;
}, {
    message: string;
    userId: number;
    token: string;
}>;
export declare const LoginResponseSchema: z.ZodObject<{
    message: z.ZodString;
    userId: z.ZodNumber;
    token: z.ZodString;
    profileComplete: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    message: string;
    userId: number;
    token: string;
    profileComplete: boolean;
}, {
    message: string;
    userId: number;
    token: string;
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
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type UserData = z.infer<typeof UserDataSchema>;
