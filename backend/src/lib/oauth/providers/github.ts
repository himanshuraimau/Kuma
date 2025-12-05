import type { OAuthConfig, OAuthUserInfo } from '../../../types/apps.types';

/**
 * GitHub OAuth tokens
 */
export interface GitHubOAuthTokens {
    access_token: string;
    token_type: string;
    scope: string;
}

/**
 * GitHub OAuth provider
 */
export class GitHubOAuthProvider {
    private config: OAuthConfig;

    constructor(config: OAuthConfig) {
        this.config = config;
    }

    /**
     * Generate authorization URL for user to visit
     */
    getAuthorizationUrl(state: string): string {
        const params = new URLSearchParams({
            client_id: this.config.clientId,
            redirect_uri: this.config.redirectUri,
            scope: this.config.scopes.join(' '),
            state,
            allow_signup: 'true',
        });

        return `https://github.com/login/oauth/authorize?${params.toString()}`;
    }

    /**
     * Exchange authorization code for tokens
     */
    async exchangeCodeForTokens(code: string): Promise<GitHubOAuthTokens> {
        const response = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                client_id: this.config.clientId,
                client_secret: this.config.clientSecret,
                code,
                redirect_uri: this.config.redirectUri,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to exchange code for tokens');
        }

        const data = await response.json() as any;
        
        if (data.error) {
            throw new Error(data.error_description || data.error);
        }

        return {
            access_token: data.access_token,
            token_type: data.token_type || 'bearer',
            scope: data.scope || '',
        };
    }

    /**
     * Get user info from GitHub
     */
    async getUserInfo(tokens: GitHubOAuthTokens): Promise<OAuthUserInfo> {
        const response = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `Bearer ${tokens.access_token}`,
                'Accept': 'application/vnd.github.v3+json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to get user info');
        }

        const user = await response.json() as any;

        // Get user's email if not public
        let email = user.email;
        if (!email) {
            const emailResponse = await fetch('https://api.github.com/user/emails', {
                headers: {
                    'Authorization': `Bearer ${tokens.access_token}`,
                    'Accept': 'application/vnd.github.v3+json',
                },
            });

            if (emailResponse.ok) {
                const emails = await emailResponse.json() as any[];
                const primaryEmail = emails.find((e: any) => e.primary);
                email = primaryEmail?.email || emails[0]?.email;
            }
        }

        return {
            email: email || undefined,
            name: user.name || user.login,
            picture: user.avatar_url,
            username: user.login,
        };
    }

    /**
     * Validate tokens are still valid
     */
    async validateTokens(tokens: GitHubOAuthTokens): Promise<boolean> {
        try {
            await this.getUserInfo(tokens);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Refresh access token (GitHub OAuth tokens don't expire, so just validate)
     */
    async refreshAccessToken(tokens: GitHubOAuthTokens): Promise<GitHubOAuthTokens> {
        const isValid = await this.validateTokens(tokens);
        if (!isValid) {
            throw new Error('GitHub token is no longer valid');
        }
        return tokens;
    }
}
