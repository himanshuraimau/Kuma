import type { BaseApp, OAuthConfig } from '../../types/apps.types';
import { GitHubOAuthProvider } from '../../lib/oauth/providers/github';

/**
 * GitHub app integration
 */
export class GitHubApp implements BaseApp {
    name = 'github';
    displayName = 'GitHub';
    description = 'Manage repositories, issues, pull requests, and more';
    category = 'development' as const;
    icon = '🐙';
    authType = 'oauth2' as const;

    getAuthConfig(): OAuthConfig {
        return {
            provider: 'github',
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
            scopes: [
                'repo', // Full control of private repositories
                'read:user', // Read user profile data
                'user:email', // Access user email addresses
            ],
            redirectUri: `${process.env.BACKEND_URL}/api/apps/github/callback`,
        };
    }

    async initialize(credentials: any): Promise<void> {
        // GitHub tokens don't require initialization like Google OAuth
        // Just validate they work
        await this.validateCredentials(credentials);
    }

    async validateCredentials(credentials: any): Promise<boolean> {
        try {
            const response = await fetch('https://api.github.com/user', {
                headers: {
                    'Authorization': `Bearer ${credentials.access_token}`,
                    'Accept': 'application/vnd.github.v3+json',
                },
            });

            return response.ok;
        } catch (error) {
            return false;
        }
    }

    async refreshCredentials(credentials: any): Promise<any> {
        const config = this.getAuthConfig();
        const provider = new GitHubOAuthProvider(config);

        // GitHub OAuth tokens don't expire, so just validate
        const isValid = await provider.validateTokens(credentials);
        if (!isValid) {
            throw new Error('GitHub credentials are no longer valid. Please reconnect.');
        }

        return credentials;
    }
}
