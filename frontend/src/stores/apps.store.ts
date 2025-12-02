import { create } from 'zustand';
import type { App, ConnectedApp, Tool } from '@/types/apps.types';
import * as appsApi from '@/api/apps.api';

interface AppsState {
    // State
    apps: App[];
    connectedApps: ConnectedApp[];
    tools: Tool[];
    isLoading: boolean;
    error: string | null;

    // Actions
    loadApps: () => Promise<void>;
    loadConnectedApps: () => Promise<void>;
    loadTools: () => Promise<void>;
    connectApp: (appName: string) => Promise<void>;
    disconnectApp: (appName: string) => Promise<void>;
    clearError: () => void;
}

export const useAppsStore = create<AppsState>((set, get) => ({
    // Initial state
    apps: [],
    connectedApps: [],
    tools: [],
    isLoading: false,
    error: null,

    // Load all available apps
    loadApps: async () => {
        set({ isLoading: true, error: null });

        try {
            const response = await appsApi.getApps();
            set({ apps: response.apps, isLoading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.error || 'Failed to load apps',
                isLoading: false,
            });
        }
    },

    // Load connected apps
    loadConnectedApps: async () => {
        set({ isLoading: true, error: null });

        try {
            const response = await appsApi.getConnectedApps();
            set({ connectedApps: response.apps, isLoading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.error || 'Failed to load connected apps',
                isLoading: false,
            });
        }
    },

    // Load available tools
    loadTools: async () => {
        try {
            const response = await appsApi.getTools();
            set({ tools: response.tools });
        } catch (error: any) {
            console.error('Failed to load tools:', error);
        }
    },

    // Connect an app (initiates OAuth flow)
    connectApp: async (appName: string) => {
        set({ isLoading: true, error: null });

        try {
            const response = await appsApi.connectApp(appName);

            // Redirect to OAuth URL
            window.location.href = response.authUrl;
        } catch (error: any) {
            set({
                error: error.response?.data?.error || 'Failed to connect app',
                isLoading: false,
            });
        }
    },

    // Disconnect an app
    disconnectApp: async (appName: string) => {
        set({ isLoading: true, error: null });

        try {
            await appsApi.disconnectApp(appName);

            // Reload apps and connected apps
            await get().loadApps();
            await get().loadConnectedApps();
            await get().loadTools();

            set({ isLoading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.error || 'Failed to disconnect app',
                isLoading: false,
            });
        }
    },

    // Clear error
    clearError: () => {
        set({ error: null });
    },
}));
