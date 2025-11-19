import type { PasswordStrength, PasswordRequirement } from '@/types/auth.types';

/**
 * Calculate password strength based on requirements
 */
export const calculatePasswordStrength = (password: string): PasswordStrength => {
    const requirements = {
        minLength: password.length >= 8,
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    const metCount = Object.values(requirements).filter(Boolean).length;

    if (metCount < 3) return 'weak';
    if (metCount < 5) return 'medium';
    return 'strong';
};

/**
 * Check which password requirements are met
 */
export const checkPasswordRequirements = (password: string): PasswordRequirement[] => {
    return [
        {
            id: 'minLength',
            label: 'At least 8 characters',
            met: password.length >= 8,
        },
        {
            id: 'hasUppercase',
            label: 'One uppercase letter (A-Z)',
            met: /[A-Z]/.test(password),
            regex: /[A-Z]/,
        },
        {
            id: 'hasLowercase',
            label: 'One lowercase letter (a-z)',
            met: /[a-z]/.test(password),
            regex: /[a-z]/,
        },
        {
            id: 'hasNumber',
            label: 'One number (0-9)',
            met: /[0-9]/.test(password),
            regex: /[0-9]/,
        },
        {
            id: 'hasSpecial',
            label: 'One special character (!@#$%)',
            met: /[!@#$%^&*(),.?":{}|<>]/.test(password),
            regex: /[!@#$%^&*(),.?":{}|<>]/,
        },
    ];
};

/**
 * Get password strength color
 */
export const getPasswordStrengthColor = (strength: PasswordStrength) => {
    switch (strength) {
        case 'weak':
            return {
                bg: 'bg-red-500',
                text: 'text-red-400',
                width: 'w-1/3',
            };
        case 'medium':
            return {
                bg: 'bg-amber-500',
                text: 'text-amber-400',
                width: 'w-2/3',
            };
        case 'strong':
            return {
                bg: 'bg-green-500',
                text: 'text-green-400',
                width: 'w-full',
            };
    }
};
