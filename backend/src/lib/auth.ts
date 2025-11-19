import { supabase } from './supabase';
import { prisma } from '../db/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { SignupRequest, LoginRequest, AuthResponse } from '../types/auth.types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const SALT_ROUNDS = 10;

/**
 * Sign up a new user with email and password
 */
export async function signUp(data: SignupRequest): Promise<AuthResponse> {
    const { email, password, name } = data;

    // Check if user already exists in database
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        throw new Error('User with this email already exists');
    }

    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
    });

    if (authError) {
        throw new Error(`Supabase auth error: ${authError.message}`);
    }

    if (!authData.user) {
        throw new Error('Failed to create user in Supabase');
    }

    // Hash password for our database
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user in our database
    const user = await prisma.user.create({
        data: {
            id: authData.user.id,
            email,
            name,
            password: hashedPassword,
        },
    });

    // Generate JWT token
    const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
    );

    return {
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
        },
        token,
    };
}

/**
 * Sign in an existing user
 */
export async function signIn(data: LoginRequest): Promise<AuthResponse> {
    const { email, password } = data;

    // Find user in database
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        throw new Error('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new Error('Invalid email or password');
    }

    // Sign in with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (authError) {
        throw new Error(`Authentication failed: ${authError.message}`);
    }

    // Generate JWT token
    const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
    );

    return {
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
        },
        token,
    };
}

/**
 * Verify JWT token and return user ID
 */
export function verifyToken(token: string): { userId: string; email: string } {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
        return decoded;
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
}

/**
 * Get user by ID
 */
export async function getUser(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    if (!user) {
        throw new Error('User not found');
    }

    return user;
}

/**
 * Sign out user (invalidate Supabase session)
 */
export async function signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
        throw new Error(`Sign out failed: ${error.message}`);
    }
}
