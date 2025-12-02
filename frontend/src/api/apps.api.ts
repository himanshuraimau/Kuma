import { apiClient } from './client';
import type {
    GetAppsResponse,
    GetConnectedAppsResponse,
    ConnectAppResponse,
    GetToolsResponse,
} from '@/types/apps.types';

/**
 * Get all available apps
 * GET /api/apps
 */
export const getApps = async (): Promise<GetAppsResponse> => {
    const response = await apiClient.get('/apps');
    return response.data;
};

/**
 * Get user's connected apps
 * GET /api/apps/connected
 */
export const getConnectedApps = async (): Promise<GetConnectedAppsResponse> => {
    const response = await apiClient.get('/apps/connected');
    return response.data;
};

/**
 * Get available tools based on connected apps
 * GET /api/apps/tools
 */
export const getTools = async (): Promise<GetToolsResponse> => {
    const response = await apiClient.get('/apps/tools');
    return response.data;
};

/**
 * Initiate OAuth connection for an app
 * GET /api/apps/:appName/connect
 */
export const connectApp = async (appName: string): Promise<ConnectAppResponse> => {
    const response = await apiClient.get(`/apps/${appName}/connect`);
    return response.data;
};

/**
 * Disconnect an app
 * DELETE /api/apps/:appName/disconnect
 */
export const disconnectApp = async (appName: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`/apps/${appName}/disconnect`);
    return response.data;
};
