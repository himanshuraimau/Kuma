// API response types

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: ApiError;
    message?: string;
}

export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, any>;
}

export interface AuthResponse {
    message: string;
    user: {
        id: string;
        email: string;
        name: string;
    };
    token: string;
}
