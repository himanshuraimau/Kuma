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
    const existingUser = await prisma.users.findUnique({
        where: { email },
    });

    if (existingUser) {
        throw new Error('User with this email already exists');
    }

    // Hash password
    console.log(`🔐 Hashing password (length: ${password.length})`);
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    console.log(`✅ Password hashed (length: ${hashedPassword.length})`);

    // Create user in database
    const user = await prisma.users.create({
        data: {
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

    console.log(`🔍 Looking up user with email: ${email}`);

    // Find user in database
    const user = await prisma.users.findUnique({
        where: { email },
    });

    if (!user) {
        console.log(`❌ User not found: ${email}`);
        throw new Error('Invalid email or password');
    }

    console.log(`✅ User found: ${user.email} (ID: ${user.id})`);
    console.log(`🔍 User password field exists: ${!!user.password}`);
    console.log(`🔍 User password field length: ${user.password?.length || 0}`);
    console.log(`🔍 Input password length: ${password.length}`);

    // Check if password field is null or empty
    if (!user.password) {
        console.log(`❌ User password is null or empty for: ${email}`);
        throw new Error('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log(`🔐 Password comparison result: ${isPasswordValid}`);
    
    if (!isPasswordValid) {
        console.log(`❌ Password mismatch for user: ${email}`);
        throw new Error('Invalid email or password');
    }

    console.log(`✅ Password verified for user: ${email}`);

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
    const user = await prisma.users.findUnique({
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
 * Sign out user (JWT is stateless, so this is a no-op)
 * Client should discard the token
 */
export async function signOut(): Promise<void> {
    // No-op for JWT-based auth
    // Client should remove token from storage
}
