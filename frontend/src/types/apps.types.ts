// App types
export interface App {
    id: string;
    name: string;
    displayName: string;
    description: string;
    icon: string;
    category: 'communication' | 'productivity' | 'development' | 'storage';
    authType: 'oauth2' | 'api_key' | 'none';
    isConnected: boolean;
    connectedAt?: string;
    metadata?: {
        email?: string;
        [key: string]: any;
    };
}

export interface ConnectedApp {
    id: string;
    appName: string;
    displayName: string;
    icon: string;
    connectedAt: string;
    metadata?: {
        email?: string;
        [key: string]: any;
    };
}

export interface Tool {
    name: string;
    description: string;
    category: string;
    appName: string;
}

// API Response types
export interface GetAppsResponse {
    apps: App[];
}

export interface GetConnectedAppsResponse {
    apps: ConnectedApp[];
}

export interface ConnectAppResponse {
    authUrl: string;
}

export interface GetToolsResponse {
    tools: Tool[];
}
