import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { UserRole } from '../models/User';

/**
 * Role-based access control middleware
 */
export function requireRole(...allowedRoles: UserRole[]) {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }

        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: 'Insufficient permissions',
            });
            return;
        }

        next();
    };
}

/**
 * Admin-only middleware
 */
export function requireAdmin(
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void {
    requireRole(UserRole.ADMIN)(req, res, next);
}

/**
 * Pharmacist or Admin middleware
 */
export function requirePharmacist(
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void {
    requireRole(UserRole.ADMIN, UserRole.PHARMACIST)(req, res, next);
}
