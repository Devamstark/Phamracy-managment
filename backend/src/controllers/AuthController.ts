import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { AuthRequest } from '../middleware/auth';
import { validate, loginSchema, registerSchema } from '../utils/validators';
import { UserRole } from '../models/User';

const authService = new AuthService();

/**
 * Authentication Controller
 */
export class AuthController {
    /**
     * Register new user
     * POST /api/auth/register
     */
    async register(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { value, error } = validate(registerSchema, req.body);

            if (error) {
                res.status(400).json({ success: false, message: error });
                return;
            }

            const { username, email, password, role } = value as any;

            const user = await authService.register(username, email, password, role as UserRole);

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Login user
     * POST /api/auth/login
     */
    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { value, error } = validate(loginSchema, req.body);

            if (error) {
                res.status(400).json({ success: false, message: error });
                return;
            }

            const { username, password } = value as any;

            const { user, token, refreshToken } = await authService.login(username, password);

            res.json({
                success: true,
                message: 'Login successful',
                data: {
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        role: user.role,
                    },
                    token,
                    refreshToken,
                },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Refresh access token
     * POST /api/auth/refresh
     */
    async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                res.status(400).json({
                    success: false,
                    message: 'Refresh token is required',
                });
                return;
            }

            const { token } = await authService.refreshToken(refreshToken);

            res.json({
                success: true,
                data: { token },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get current user profile
     * GET /api/auth/me
     */
    async getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Not authenticated',
                });
                return;
            }

            res.json({
                success: true,
                data: {
                    id: req.user.id,
                    username: req.user.username,
                    email: req.user.email,
                    role: req.user.role,
                },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Change password
     * POST /api/auth/change-password
     */
    async changePassword(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.userId) {
                res.status(401).json({
                    success: false,
                    message: 'Not authenticated',
                });
                return;
            }

            const { oldPassword, newPassword } = req.body;

            if (!oldPassword || !newPassword) {
                res.status(400).json({
                    success: false,
                    message: 'Old password and new password are required',
                });
                return;
            }

            await authService.changePassword(req.userId, oldPassword, newPassword);

            res.json({
                success: true,
                message: 'Password changed successfully',
            });
        } catch (error) {
            next(error);
        }
    }
}
