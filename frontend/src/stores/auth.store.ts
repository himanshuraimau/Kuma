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
        const storedUser = localStorage.getItem('auth_user');

        if (!token) {
            set({ isAuthenticated: false, user: null, token: null, isLoading: false });
            return;
        }

        // If we have both token and user in localStorage, set them immediately
        // This prevents the "logged out" flash on page reload
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                set({
                    user,
                    token,
                    isAuthenticated: true,
                    isLoading: false,
                });
            } catch (e) {
                console.error('Failed to parse stored user:', e);
            }
        }

        try {
            set({ isLoading: true });
            const response = await getCurrentUser();

            // Update with fresh user data from server
            localStorage.setItem('auth_user', JSON.stringify(response.user));
            set({
                user: response.user,
                token,
                isAuthenticated: true,
                isLoading: false,
            });
        } catch (error: any) {
            console.error('Auth check failed:', error);

            // Only clear auth if it's a 401 (unauthorized) error
            // Don't log out on network errors or other issues
            if (error.response?.status === 401) {
                console.log('Token invalid, clearing auth');
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth_user');
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    isLoading: false,
                });
            } else {
                // Network error or server issue - keep user logged in
                console.log('Network error, keeping user logged in');
                set({ isLoading: false });
            }
        }
    },

    clearError: () => set({ error: null }),
}));
