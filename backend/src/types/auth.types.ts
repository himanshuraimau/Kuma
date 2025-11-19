import { z } from 'zod';

// Zod Schemas for validation
export const signupSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(1, 'Name is required'),
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

// TypeScript Types
export type SignupRequest = z.infer<typeof signupSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;

export interface AuthResponse {
    user: {
        id: string;
        email: string;
        name: string;
    };
    token: string;
}

export interface AuthUser {
    id: string;
    email: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}
