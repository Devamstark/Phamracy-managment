import api from './api';

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface User {
    id: string;
    username: string;
    email: string;
    role: 'ADMIN' | 'PHARMACIST' | 'CASHIER';
}

export interface AuthResponse {
    user: User;
    token: string;
    refreshToken: string;
}

/**
 * Authentication service
 */
export const authService = {
    /**
     * Login user
     */
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const response = await api.post('/auth/login', credentials);
        return response.data.data;
    },

    /**
     * Get current user profile
     */
    async getProfile(): Promise<User> {
        const response = await api.get('/auth/me');
        return response.data.data;
    },

    /**
     * Logout user
     */
    logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },
};
