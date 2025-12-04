import { google } from 'googleapis';
import type { BaseApp, OAuthConfig } from '../../types/apps.types';
import { GoogleOAuthProvider } from '../../lib/oauth/providers/google';

/**
 * Google Docs app integration
 */
export class DocsApp implements BaseApp {
    name = 'docs';
    displayName = 'Google Docs';
    description = 'Create, read, and manage Google Docs documents';
    category = 'productivity' as const;
    icon = '📄';
    authType = 'oauth2' as const;

    getAuthConfig(): OAuthConfig {
        return {
            provider: 'google',
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            scopes: [
                'https://www.googleapis.com/auth/documents',
                'https://www.googleapis.com/auth/drive.readonly',
                'https://www.googleapis.com/auth/userinfo.email',
            ],
            redirectUri: `${process.env.BACKEND_URL}/api/apps/docs/callback`,
        };
    }

    // Tools are now defined in lib/ai/tools/app.tools.ts and loaded per-user

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

            const drive = google.drive({ version: 'v3', auth: oauth2Client });
            await drive.files.list({ pageSize: 1 });
            return true;
        } catch (error) {
            return false;
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
