import type { Request, Response } from 'express';
import { signUp, signIn, signOut } from '../lib/auth';
import { signupSchema, loginSchema } from '../types/auth.types';
import { ZodError } from 'zod';

/**
 * Handle user signup
 */
export async function signup(req: Request, res: Response): Promise<void> {
    try {
        // Validate request body
        const validatedData = signupSchema.parse(req.body);

        // Create user
        const result = await signUp(validatedData);

        res.status(201).json({
            message: 'User created successfully',
            ...result,
        });
    } catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({
                error: 'Validation error',
                details: error.errors,
            });
            return;
        }

        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
            return;
        }

        res.status(500).json({ error: 'Internal server error' });
    }
}

/**
 * Handle user login
 */
export async function login(req: Request, res: Response): Promise<void> {
    try {
        // Validate request body
        const validatedData = loginSchema.parse(req.body);

        // Sign in user
        const result = await signIn(validatedData);

        res.status(200).json({
            message: 'Login successful',
            ...result,
        });
    } catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({
                error: 'Validation error',
                details: error.errors,
            });
            return;
        }

        if (error instanceof Error) {
            res.status(401).json({ error: error.message });
            return;
        }

        res.status(500).json({ error: 'Internal server error' });
    }
}

/**
 * Get current authenticated user
 */
export async function me(req: Request, res: Response): Promise<void> {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        res.status(200).json({
            user: req.user,
        });
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
            return;
        }

        res.status(500).json({ error: 'Internal server error' });
    }
}

/**
 * Handle user logout
 */
export async function logout(req: Request, res: Response): Promise<void> {
    try {
        await signOut();

        res.status(200).json({
            message: 'Logout successful',
        });
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
            return;
        }

        res.status(500).json({ error: 'Internal server error' });
    }
}
