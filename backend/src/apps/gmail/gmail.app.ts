import { google } from 'googleapis';
import type { BaseApp, OAuthConfig } from '../../types/apps.types';
import { GoogleOAuthProvider } from '../../lib/oauth/providers/google';

/**
 * Gmail app integration - metadata and OAuth configuration
 * Tools are now defined in lib/ai/tools/app.tools.ts
 */
export class GmailApp implements BaseApp {
    name = 'gmail';
    displayName = 'Gmail';
    description = 'Send and read emails, manage your inbox';
    category = 'communication' as const;
    icon = '📧';
    authType = 'oauth2' as const;

    getAuthConfig(): OAuthConfig {
        return {
            provider: 'google',
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            scopes: [
                'https://www.googleapis.com/auth/gmail.readonly',
                'https://www.googleapis.com/auth/gmail.send',
                'https://www.googleapis.com/auth/gmail.compose',
                'https://www.googleapis.com/auth/userinfo.email',
            ],
            redirectUri: `${process.env.BACKEND_URL}/api/apps/gmail/callback`,
        };
    }

    async initialize(credentials: any): Promise<void> {
        // Initialize Gmail API client if needed
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

            const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
            await gmail.users.getProfile({ userId: 'me' });
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
