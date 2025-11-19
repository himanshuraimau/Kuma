// Authentication-related types

export interface LoginFormData {
    email: string;
    password: string;
    rememberMe: boolean;
}

export interface SignupFormData {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    agreedToTerms: boolean;
    marketingOptIn: boolean;
}

export interface FormErrors {
    [key: string]: string;
}

export type PasswordStrength = 'weak' | 'medium' | 'strong';

export interface PasswordRequirement {
    id: string;
    label: string;
    met: boolean;
    regex?: RegExp;
}

export interface AuthLayoutProps {
    title: string;
    subtitle: string;
    leftContent: {
        headline: string;
        subheadline: string;
        features: Array<{
            icon: React.ComponentType<{ size?: number; className?: string }>;
            text: string;
        }>;
    };
    navLink: {
        text: string;
        linkText: string;
        href: string;
    };
    children: React.ReactNode;
}
