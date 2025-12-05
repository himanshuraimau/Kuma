import crypto from 'crypto';
import { prisma } from '../../db/prisma';
import { encryptCredentials } from '../encryption';
import { appRegistry } from '../../apps/base.app';
import { GoogleOAuthProvider } from './providers/google';
import { GitHubOAuthProvider } from './providers/github';
import type { OAuthUserInfo } from '../../types/apps.types';

/**
 * OAuth service for handling app connections
 */
class OAuthService {
    // Temporary state storage (in production, use Redis)
    private stateStore = new Map<
        string,
        { userId: string; appName: string; expiresAt: number }
    >();

    /**
     * Clean up expired states
     */
    private cleanupExpiredStates() {
        const now = Date.now();
        for (const [state, data] of this.stateStore.entries()) {
            if (data.expiresAt < now) {
                this.stateStore.delete(state);
            }
        }
    }

    /**
     * Get authorization URL for user to visit
     */
    async getAuthorizationUrl(appName: string, userId: string): Promise<string> {
        const app = appRegistry.get(appName);
        if (!app) {
            throw new Error(`App "${appName}" not found`);
        }

        const config = app.getAuthConfig();

        // Generate state for CSRF protection
        const state = crypto.randomBytes(32).toString('hex');
        this.stateStore.set(state, {
            userId,
            appName,
            expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
        });

        // Clean up old states
        this.cleanupExpiredStates();

        // Get provider
        if (config.provider === 'google') {
            const provider = new GoogleOAuthProvider(config);
            return provider.getAuthorizationUrl(state);
        }

        if (config.provider === 'github') {
            const provider = new GitHubOAuthProvider(config);
            return provider.getAuthorizationUrl(state);
        }

        throw new Error(`Unsupported OAuth provider: ${config.provider}`);
    }

    /**
     * Handle OAuth callback
     */
    async handleCallback(
        appName: string,
        code: string,
        state: string
    ): Promise<{
        userId: string;
        userInfo: OAuthUserInfo;
    }> {
        // Verify state
        const stateData = this.stateStore.get(state);
        if (!stateData || stateData.expiresAt < Date.now()) {
            throw new Error('Invalid or expired state');
        }

        if (stateData.appName !== appName) {
            throw new Error('App name mismatch');
        }

        this.stateStore.delete(state);

        const app = appRegistry.get(appName);
        if (!app) {
            throw new Error(`App "${appName}" not found`);
        }

        const config = app.getAuthConfig();

        // Exchange code for tokens
        let tokens: any;
        let userInfo: OAuthUserInfo;

        if (config.provider === 'google') {
            const provider = new GoogleOAuthProvider(config);
            tokens = await provider.exchangeCodeForTokens(code);
            userInfo = await provider.getUserInfo(tokens);
        } else if (config.provider === 'github') {
            const provider = new GitHubOAuthProvider(config);
            tokens = await provider.exchangeCodeForTokens(code);
            userInfo = await provider.getUserInfo(tokens);
        } else {
            throw new Error(`Unsupported OAuth provider: ${config.provider}`);
        }

        // Encrypt and store credentials
        const encryptedCredentials = encryptCredentials(tokens);

        // Get app from database
        const appRecord = await prisma.app.findUnique({
            where: { name: appName },
        });

        if (!appRecord) {
            throw new Error(`App "${appName}" not found in database`);
        }

        // Save to database
        await prisma.userApp.upsert({
            where: {
                userId_appId: {
                    userId: stateData.userId,
                    appId: appRecord.id,
                },
            },
            create: {
                userId: stateData.userId,
                appId: appRecord.id,
                credentials: encryptedCredentials,
                metadata: userInfo,
                isConnected: true,
            },
            update: {
                credentials: encryptedCredentials,
                metadata: userInfo,
                isConnected: true,
                updatedAt: new Date(),
            },
        });

        return {
            userId: stateData.userId,
            userInfo,
        };
    }

    /**
     * Disconnect an app
     */
    async disconnectApp(userId: string, appName: string): Promise<void> {
        const appRecord = await prisma.app.findUnique({
            where: { name: appName },
        });

        if (!appRecord) {
            throw new Error(`App "${appName}" not found`);
        }

        await prisma.userApp.updateMany({
            where: {
                userId,
                appId: appRecord.id,
            },
            data: {
                isConnected: false,
            },
        });
    }

    /**
     * Refresh OAuth tokens for an app
     */
    async refreshTokens(userId: string, appName: string): Promise<void> {
        const userApp = await prisma.userApp.findFirst({
            where: {
                userId,
                app: { name: appName },
                isConnected: true,
            },
            include: { app: true },
        });

        if (!userApp) {
            throw new Error(`App "${appName}" not connected`);
        }

        const app = appRegistry.get(appName);
        if (!app) {
            throw new Error(`App "${appName}" not found`);
        }

        // Refresh credentials using app's method
        const newCredentials = await app.refreshCredentials(userApp.credentials);
        const encryptedCredentials = encryptCredentials(newCredentials);

        await prisma.userApp.update({
            where: { id: userApp.id },
            data: {
                credentials: encryptedCredentials,
                updatedAt: new Date(),
            },
        });
    }
}

export const oauthService = new OAuthService();
