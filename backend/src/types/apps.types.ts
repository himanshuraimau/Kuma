import type { z } from 'zod';

/**
 * OAuth configuration for an app
 */
export interface OAuthConfig {
    provider: 'google' | 'github' | 'microsoft';
    clientId: string;
    clientSecret: string;
    scopes: string[];
    redirectUri: string;
}

/**
 * Base app interface that all apps must implement
 * Note: Tools are now defined in lib/ai/tools/app.tools.ts using AI SDK format
 */
export interface BaseApp {
    name: string;
    displayName: string;
    description: string;
    category: 'communication' | 'productivity' | 'development' | 'storage';
    icon: string;
    authType: 'oauth2' | 'api_key' | 'none';

    /**
     * Get OAuth configuration for this app
     */
    getAuthConfig(): OAuthConfig;

    /**
     * Initialize app with user credentials
     */
    initialize(credentials: any): Promise<void>;

    /**
     * Validate credentials are still valid
     */
    validateCredentials(credentials: any): Promise<boolean>;

    /**
     * Refresh OAuth tokens if needed
     */
    refreshCredentials(credentials: any): Promise<any>;
}

/**
 * OAuth tokens from Google
 */
export interface GoogleOAuthTokens {
    access_token: string;
    refresh_token?: string;
    scope: string;
    token_type: string;
    expiry_date: number;
}

/**
 * User info from OAuth provider
 */
export interface OAuthUserInfo {
    email?: string;
    name?: string;
    picture?: string;
    [key: string]: any; // Allow additional properties for JSON storage
}
