import type { Request, Response } from 'express';
import { signUp, signIn, signOut } from '../lib/auth';
import { signupSchema, loginSchema } from '../types/auth.types';
import { ZodError } from 'zod';

/**
 * Handle user signup
 */
export async function signup(req: Request, res: Response): Promise<void> {
    try {
        console.log('📝 Signup request received:', { email: req.body?.email, name: req.body?.name });
        
        // Validate request body
        const validatedData = signupSchema.parse(req.body);
        console.log('✅ Validation passed');

        // Create user
        const result = await signUp(validatedData);
        console.log('✅ User created successfully:', result.user.email);

        res.status(201).json({
            message: 'User created successfully',
            ...result,
        });
    } catch (error) {
        console.error('❌ Signup error:', error);
        
        if (error instanceof ZodError) {
            console.error('Validation errors:', error.errors);
            res.status(400).json({
                error: 'Validation error',
                details: error.errors,
            });
            return;
        }

        if (error instanceof Error) {
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
            res.status(400).json({ error: error.message });
            return;
        }

        console.error('Unknown error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

/**
 * Handle user login
 */
export async function login(req: Request, res: Response): Promise<void> {
    try {
        console.log('🔐 Login request received:', { email: req.body?.email });
        
        // Validate request body
        const validatedData = loginSchema.parse(req.body);
        console.log('✅ Validation passed');

        // Sign in user
        const result = await signIn(validatedData);
        console.log('✅ Login successful:', result.user.email);

        res.status(200).json({
            message: 'Login successful',
            ...result,
        });
    } catch (error) {
        console.error('❌ Login error:', error);
        
        if (error instanceof ZodError) {
            console.error('Validation errors:', error.errors);
            res.status(400).json({
                error: 'Validation error',
                details: error.errors,
            });
            return;
        }

        if (error instanceof Error) {
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
            res.status(401).json({ error: error.message });
            return;
        }

        console.error('Unknown error:', error);
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
