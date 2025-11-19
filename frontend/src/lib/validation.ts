/**
 * Validate email format
 */
export const validateEmail = (email: string): string | null => {
    if (!email) {
        return 'Email is required';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return 'Please enter a valid email address';
    }

    return null;
};

/**
 * Validate password
 */
export const validatePassword = (password: string): string | null => {
    if (!password) {
        return 'Password is required';
    }

    if (password.length < 8) {
        return 'Password must be at least 8 characters';
    }

    return null;
};

/**
 * Validate full name
 */
export const validateFullName = (name: string): string | null => {
    if (!name) {
        return 'Full name is required';
    }

    if (name.trim().length < 2) {
        return 'Name must be at least 2 characters';
    }

    if (name.trim().length > 50) {
        return 'Name must be less than 50 characters';
    }

    return null;
};

/**
 * Validate password match
 */
export const validatePasswordMatch = (
    password: string,
    confirmPassword: string
): string | null => {
    if (!confirmPassword) {
        return 'Please confirm your password';
    }

    if (password !== confirmPassword) {
        return 'Passwords do not match';
    }

    return null;
};

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
    REQUIRED_FIELD: 'This field is required',
    INVALID_EMAIL: 'Please enter a valid email address',
    WEAK_PASSWORD: 'Password does not meet requirements',
    PASSWORD_MISMATCH: 'Passwords do not match',
    TERMS_REQUIRED: 'You must agree to the terms and conditions',
    NETWORK_ERROR: 'Unable to connect. Please try again.',
    UNKNOWN_ERROR: 'An error occurred. Please try again.',
} as const;
