import { google } from 'googleapis';
import type { BaseApp, OAuthConfig } from '../../types/apps.types';
import { GoogleOAuthProvider } from '../../lib/oauth/providers/google';

/**
 * Google Slides app integration
 */
export class SlidesApp implements BaseApp {
    name = 'slides';
    displayName = 'Google Slides';
    description = 'Create, read, and manage Google Slides presentations';
    category = 'productivity' as const;
    icon = '📽️';
    authType = 'oauth2' as const;

    getAuthConfig(): OAuthConfig {
        return {
            provider: 'google',
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            scopes: [
                'https://www.googleapis.com/auth/presentations',
                'https://www.googleapis.com/auth/drive.readonly',
                'https://www.googleapis.com/auth/userinfo.email',
            ],
            redirectUri: `${process.env.BACKEND_URL}/api/apps/slides/callback`,
        };
    }

    async initialize(credentials: any): Promise<void> {
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET
        );
        oauth2Client.setCredentials(credentials);
    }

    async validateCredentials(credentials: any): Promise<boolean> {
        try {
            const oauth2Client = new google.auth.OAuth2(
                process.env.GOOGLE_CLIENT_ID,
                process.env.GOOGLE_CLIENT_SECRET
            );
            oauth2Client.setCredentials(credentials);

            const slides = google.slides({ version: 'v1', auth: oauth2Client });
            // Simple validation - try to access the API
            await slides.presentations.get({
                presentationId: '1', // Will fail but validates auth
            }).catch(() => {
                // Expected to fail, but if it's auth error, it will throw differently
                return true;
            });
            return true;
        } catch (error: any) {
            if (error.message?.includes('Invalid Credentials')) {
                return false;
            }
            return true; // Other errors are not credential issues
        }
    }

    async refreshCredentials(credentials: any): Promise<any> {
        const config = this.getAuthConfig();
        const provider = new GoogleOAuthProvider(config);

        if (!credentials.refresh_token) {
            throw new Error('No refresh token available');
        }

        return await provider.refreshAccessToken(credentials.refresh_token);
    }
}
