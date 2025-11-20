import { apiClient } from './client';
import type { LoginFormData, SignupFormData } from '@/types/auth.types';
import type { AuthResponse } from '@/types/api.types';

/**
 * Login user
 */
export const login = async (data: LoginFormData): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', {
        email: data.email,
        password: data.password,
    });
    return response.data;
};

/**
 * Register new user
 */
export const register = async (
    data: Omit<SignupFormData, 'confirmPassword' | 'agreedToTerms' | 'marketingOptIn'>
): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/signup', {
        email: data.email,
        password: data.password,
        name: data.fullName, // Map fullName to name for backend
    });
    return response.data;
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = async (): Promise<{ user: AuthResponse['user'] }> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
};

/**
 * Logout user
 */
export const logout = async (): Promise<void> => {
    await apiClient.post('/auth/logout');
};
