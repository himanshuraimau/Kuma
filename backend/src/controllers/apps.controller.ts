import type { Request, Response } from 'express';
import { appRegistry } from '../apps';
import { oauthService } from '../lib/oauth/oauth.service';
import { loadUserAppTools, createGmailTools, createCalendarTools, createDocsTools } from '../lib/ai/tools/app.tools';
import { prisma } from '../db/prisma';

/**
 * Get all available apps
 * GET /api/apps
 */
export async function getApps(req: Request, res: Response) {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Get all available apps
        const availableApps = appRegistry.getAll();

        // Get user's connected apps
        const userApps = await prisma.userApp.findMany({
            where: { userId, isConnected: true },
            include: { app: true },
        });

        const userAppMap = new Map(userApps.map((ua) => [ua.app.name, ua]));

        // Combine data
        const apps = availableApps.map((app) => ({
            id: app.name,
            name: app.name,
            displayName: app.displayName,
            description: app.description,
            icon: app.icon,
            category: app.category,
            authType: app.authType,
            isConnected: userAppMap.has(app.name),
            connectedAt: userAppMap.get(app.name)?.createdAt,
            metadata: userAppMap.get(app.name)?.metadata,
        }));

        return res.json({ apps });
    } catch (error) {
        console.error('Error in getApps:', error);
        return res.status(500).json({ error: 'Failed to fetch apps' });
    }
}

/**
 * Get user's connected apps
 * GET /api/apps/connected
 */
export async function getConnectedApps(req: Request, res: Response) {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const userApps = await prisma.userApp.findMany({
            where: { userId, isConnected: true },
            include: { app: true },
        });

        const apps = userApps.map((ua) => {
            const app = appRegistry.get(ua.app.name);
            return {
                id: ua.id,
                appName: ua.app.name,
                displayName: ua.app.displayName,
                icon: app?.icon || '📦',
                connectedAt: ua.createdAt,
                metadata: ua.metadata,
            };
        });

        return res.json({ apps });
    } catch (error) {
        console.error('Error in getConnectedApps:', error);
        return res.status(500).json({ error: 'Failed to fetch connected apps' });
    }
}

/**
 * Initiate OAuth connection for an app
 * GET /api/apps/:appName/connect
 */
export async function connectApp(req: Request, res: Response) {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { appName } = req.params;

        const authUrl = await oauthService.getAuthorizationUrl(appName as string, userId);

        return res.json({ authUrl });
    } catch (error: any) {
        console.error('Error in connectApp:', error);
        return res.status(500).json({
            error: error.message || 'Failed to initiate connection',
        });
    }
}

/**
 * Handle OAuth callback
 * GET /api/apps/:appName/callback
 */
export async function handleCallback(req: Request, res: Response) {
    try {
        const { appName } = req.params;
        const { code, state } = req.query;

        if (!code || !state) {
            return res.redirect(
                `${process.env.FRONTEND_URL}/apps?error=missing_params`
            );
        }

        const result = await oauthService.handleCallback(
            appName as string,
            code as string,
            state as string
        );

        return res.redirect(
            `${process.env.FRONTEND_URL}/apps?success=true&app=${appName}`
        );
    } catch (error: any) {
        console.error('Error in handleCallback:', error);
        return res.redirect(
            `${process.env.FRONTEND_URL}/apps?error=${encodeURIComponent(error.message)}`
        );
    }
}

/**
 * Disconnect an app
 * DELETE /api/apps/:appName/disconnect
 */
export async function disconnectApp(req: Request, res: Response) {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { appName } = req.params;

        if (!appName) {
            return res.status(400).json({ error: 'App name is required' });
        }

        await oauthService.disconnectApp(userId, appName);

        return res.json({
            success: true,
            message: 'App disconnected successfully',
        });
    } catch (error: any) {
        console.error('Error in disconnectApp:', error);
        return res.status(500).json({
            error: error.message || 'Failed to disconnect app',
        });
    }
}

/**
 * Get available tools for user based on connected apps
 * GET /api/apps/tools
 */
export async function getAvailableTools(req: Request, res: Response) {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Get user's connected apps
        const userApps = await prisma.userApp.findMany({
            where: { userId, isConnected: true },
            include: { app: true },
        });

        // Get tools from connected apps using new AI SDK tool loaders
        const tools: any[] = [];

        for (const userApp of userApps) {
            const appName = userApp.app.name;
            try {
                let appTools: Record<string, any> = {};

                // Call the specific loader so we can attribute tools to their app
                if (appName === 'gmail') {
                    appTools = createGmailTools(userId as string);
                } else if (appName === 'calendar') {
                    appTools = createCalendarTools(userId as string);
                } else if (appName === 'docs') {
                    appTools = createDocsTools(userId as string);
                } else {
                    // Fallback: attempt to load all and pick keys that match this appName
                    const allTools = await loadUserAppTools(userId as string);
                    appTools = Object.fromEntries(Object.entries(allTools).filter(([k]) => k.startsWith(`${appName}_`) || k.includes(appName)));
                }

                for (const [toolName, toolImpl] of Object.entries(appTools)) {
                    tools.push({
                        name: toolName,
                        description: (toolImpl as any).description || '',
                        category: appName,
                        appName,
                    });
                }
            } catch (err) {
                console.warn(`Failed to load tools for app ${appName}:`, err);
            }
        }

        return res.json({ tools });
    } catch (error) {
        console.error('Error in getAvailableTools:', error);
        return res.status(500).json({ error: 'Failed to fetch tools' });
    }
}
