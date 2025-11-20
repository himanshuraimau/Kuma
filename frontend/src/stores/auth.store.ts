import { create } from 'zustand';
import { login as apiLogin, register as apiRegister, getCurrentUser, logout as apiLogout } from '@/api/auth.api';
import type { LoginFormData, SignupFormData } from '@/types/auth.types';

interface User {
    id: string;
    email: string;
    name: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (data: LoginFormData) => Promise<void>;
    signup: (data: Omit<SignupFormData, 'confirmPassword' | 'agreedToTerms' | 'marketingOptIn'>) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: localStorage.getItem('auth_token'),
    isAuthenticated: false,
    isLoading: false,
    error: null,

    login: async (data: LoginFormData) => {
        try {
            set({ isLoading: true, error: null });
            const response = await apiLogin(data);

            // Store token and user
            localStorage.setItem('auth_token', response.token);
            localStorage.setItem('auth_user', JSON.stringify(response.user));

            set({
                user: response.user,
                token: response.token,
                isAuthenticated: true,
                isLoading: false,
            });
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || 'Login failed. Please try again.';
            set({ error: errorMessage, isLoading: false });
            throw new Error(errorMessage);
        }
    },

    signup: async (data: Omit<SignupFormData, 'confirmPassword' | 'agreedToTerms' | 'marketingOptIn'>) => {
        try {
            set({ isLoading: true, error: null });
            const response = await apiRegister(data);

            // Store token and user
            localStorage.setItem('auth_token', response.token);
            localStorage.setItem('auth_user', JSON.stringify(response.user));

            set({
                user: response.user,
                token: response.token,
                isAuthenticated: true,
                isLoading: false,
            });
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || 'Signup failed. Please try again.';
            set({ error: errorMessage, isLoading: false });
            throw new Error(errorMessage);
        }
    },

    logout: async () => {
        try {
            await apiLogout();
        } catch (error) {
            // Continue with logout even if API call fails
            console.error('Logout API call failed:', error);
        } finally {
            // Clear local storage and state
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            set({
                user: null,
                token: null,
                isAuthenticated: false,
                error: null,
            });
        }
    },

    checkAuth: async () => {
        const token = localStorage.getItem('auth_token');

        if (!token) {
            set({ isAuthenticated: false, user: null, token: null });
            return;
        }

        try {
            set({ isLoading: true });
            const response = await getCurrentUser();

            set({
                user: response.user,
                token,
                isAuthenticated: true,
                isLoading: false,
            });
        } catch (error) {
            // Token is invalid, clear it
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            set({
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
            });
        }
    },

    clearError: () => set({ error: null }),
}));
