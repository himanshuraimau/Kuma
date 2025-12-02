import { google } from 'googleapis';
import type { OAuthConfig, GoogleOAuthTokens, OAuthUserInfo } from '../../../types/apps.types';

/**
 * Google OAuth provider
 */
export class GoogleOAuthProvider {
    private config: OAuthConfig;

    constructor(config: OAuthConfig) {
        this.config = config;
    }

    /**
     * Generate authorization URL for user to visit
     */
    getAuthorizationUrl(state: string): string {
        const oauth2Client = new google.auth.OAuth2(
            this.config.clientId,
            this.config.clientSecret,
            this.config.redirectUri
        );

        return oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: this.config.scopes,
            state,
            prompt: 'consent', // Force consent to always get refresh token
        });
    }

    /**
     * Exchange authorization code for tokens
     */
    async exchangeCodeForTokens(code: string): Promise<GoogleOAuthTokens> {
        const oauth2Client = new google.auth.OAuth2(
            this.config.clientId,
            this.config.clientSecret,
            this.config.redirectUri
        );

        const { tokens } = await oauth2Client.getToken(code);
        return tokens as GoogleOAuthTokens;
    }

    /**
     * Get user info from Google
     */
    async getUserInfo(tokens: GoogleOAuthTokens): Promise<OAuthUserInfo> {
        const oauth2Client = new google.auth.OAuth2(
            this.config.clientId,
            this.config.clientSecret,
            this.config.redirectUri
        );

        oauth2Client.setCredentials(tokens);
        const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
        const userInfo = await oauth2.userinfo.get();

        return {
            email: userInfo.data.email || undefined,
            name: userInfo.data.name || undefined,
            picture: userInfo.data.picture || undefined,
        };
    }

    /**
     * Refresh access token
     */
    async refreshAccessToken(refreshToken: string): Promise<GoogleOAuthTokens> {
        const oauth2Client = new google.auth.OAuth2(
            this.config.clientId,
            this.config.clientSecret,
            this.config.redirectUri
        );

        oauth2Client.setCredentials({ refresh_token: refreshToken });
        const { credentials } = await oauth2Client.refreshAccessToken();
        return credentials as GoogleOAuthTokens;
    }

    /**
     * Validate tokens are still valid
     */
    async validateTokens(tokens: GoogleOAuthTokens): Promise<boolean> {
        try {
            await this.getUserInfo(tokens);
            return true;
        } catch (error) {
            return false;
        }
    }
}
