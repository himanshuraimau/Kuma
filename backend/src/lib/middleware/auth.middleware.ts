import type { Request, Response, NextFunction } from 'express';
import { verifyToken, getUser } from '../auth';

// Extend Express Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
            };
        }
    }
}

/**
 * Middleware to authenticate requests using JWT token
 */
export async function authenticate(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'No token provided' });
            return;
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token
        const { userId } = verifyToken(token);

        // Get user from database
        const user = await getUser(userId);

        // Attach user to request
        req.user = user;

        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
}
