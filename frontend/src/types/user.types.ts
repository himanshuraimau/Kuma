// User-related types

export interface User {
    id: string;
    fullName: string;
    email: string;
    createdAt: string;
    updatedAt: string;
}

export interface UserProfile extends User {
    avatar?: string;
    preferences?: UserPreferences;
}

export interface UserPreferences {
    theme?: 'light' | 'dark';
    notifications?: boolean;
    language?: string;
}
