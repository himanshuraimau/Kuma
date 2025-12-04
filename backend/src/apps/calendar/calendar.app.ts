import { google } from 'googleapis';
import type { BaseApp, OAuthConfig } from '../../types/apps.types';
import { GoogleOAuthProvider } from '../../lib/oauth/providers/google';

/**
 * Google Calendar app integration - metadata and OAuth configuration
 * Tools are now defined in lib/ai/tools/app.tools.ts
 */
export class CalendarApp implements BaseApp {
    name = 'calendar';
    displayName = 'Google Calendar';
    description = 'Schedule meetings, manage events, and check your calendar';
    category = 'productivity' as const;
    icon = '📅';
    authType = 'oauth2' as const;

    getAuthConfig(): OAuthConfig {
        return {
            provider: 'google',
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            scopes: [
                'https://www.googleapis.com/auth/calendar',
                'https://www.googleapis.com/auth/calendar.events',
                'https://www.googleapis.com/auth/userinfo.email',
            ],
            redirectUri: `${process.env.BACKEND_URL}/api/apps/calendar/callback`,
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

            const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
            await calendar.calendarList.list({ maxResults: 1 });
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
