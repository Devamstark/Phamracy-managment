import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User, UserRole } from '../models/User';
import { AppError } from '../middleware/errorHandler';

const SALT_ROUNDS = 10;

/**
 * Authentication Service
 */
export class AuthService {
    private userRepository = AppDataSource.getRepository(User);

    /**
     * Register a new user
     */
    async register(
        username: string,
        email: string,
        password: string,
        role: UserRole
    ): Promise<User> {
        // Check if user already exists
        const existingUser = await this.userRepository.findOne({
            where: [{ username }, { email }],
        });

        if (existingUser) {
            throw new AppError('Username or email already exists', 400);
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        // Create user
        const user = this.userRepository.create({
            username,
            email,
            passwordHash,
            role,
        });

        await this.userRepository.save(user);

        return user;
    }

    /**
     * Login user and generate JWT token
     */
    async login(
        username: string,
        password: string
    ): Promise<{ user: User; token: string; refreshToken: string }> {
        // Find user
        const user = await this.userRepository.findOne({ where: { username } });

        if (!user) {
            throw new AppError('Invalid credentials', 401);
        }

        if (!user.isActive) {
            throw new AppError('Account is inactive', 403);
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
            throw new AppError('Invalid credentials', 401);
        }

        // Update last login
        user.lastLogin = new Date();
        await this.userRepository.save(user);

        // Generate tokens
        const token = this.generateToken(user);
        const refreshToken = this.generateRefreshToken(user);

        return { user, token, refreshToken };
    }

    /**
     * Generate JWT access token
     */
    generateToken(user: User): string {
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new AppError('JWT_SECRET is not configured', 500);
        }

        return jwt.sign(
            {
                userId: user.id,
                username: user.username,
                role: user.role,
            },
            jwtSecret,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || '24h',
            } as any
        );
    }

    /**
     * Generate JWT refresh token
     */
    generateRefreshToken(user: User): string {
        const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
        if (!jwtRefreshSecret) {
            throw new AppError('JWT_REFRESH_SECRET is not configured', 500);
        }

        return jwt.sign(
            {
                userId: user.id,
            },
            jwtRefreshSecret,
            {
                expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
            } as any
        );
    }

    /**
     * Refresh access token using refresh token
     */
    async refreshToken(refreshToken: string): Promise<{ token: string }> {
        const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
        if (!jwtRefreshSecret) {
            throw new AppError('JWT_REFRESH_SECRET is not configured', 500);
        }

        try {
            const decoded = jwt.verify(refreshToken, jwtRefreshSecret) as {
                userId: string;
            };

            const user = await this.userRepository.findOne({
                where: { id: decoded.userId },
            });

            if (!user || !user.isActive) {
                throw new AppError('Invalid refresh token', 401);
            }

            const token = this.generateToken(user);
            return { token };
        } catch (error) {
            throw new AppError('Invalid refresh token', 401);
        }
    }

    /**
     * Change user password
     */
    async changePassword(
        userId: string,
        oldPassword: string,
        newPassword: string
    ): Promise<void> {
        const user = await this.userRepository.findOne({ where: { id: userId } });

        if (!user) {
            throw new AppError('User not found', 404);
        }

        // Verify old password
        const isPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash);

        if (!isPasswordValid) {
            throw new AppError('Invalid old password', 400);
        }

        // Hash new password
        user.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
        await this.userRepository.save(user);
    }
}
