import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/database';
import { AuditLog } from '../models/AuditLog';
import { AuthRequest } from './auth';
import logger from '../utils/logger';

/**
 * Audit logging middleware - Log all requests to audit-worthy endpoints
 */
export function auditLogger(action: string, entityType: string) {
    return async (
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        // Store original send function
        const originalSend = res.send;

        // Override send to capture response
        res.send = function (data: any): Response {
            // Only log successful operations (2xx status codes)
            if (res.statusCode >= 200 && res.statusCode < 300) {
                // Log asynchronously without blocking response
                setImmediate(async () => {
                    try {
                        const auditLogRepository = AppDataSource.getRepository(AuditLog);

                        const auditLog = auditLogRepository.create({
                            userId: req.userId,
                            action,
                            entityType,
                            entityId: req.params.id || undefined,
                            details: {
                                method: req.method,
                                path: req.path,
                                body: sanitizeBody(req.body),
                                query: req.query,
                            },
                            ipAddress: getClientIp(req),
                        });

                        await auditLogRepository.save(auditLog);
                    } catch (error) {
                        logger.error('Failed to create audit log:', error);
                    }
                });
            }

            // Call original send
            return originalSend.call(this, data);
        };

        next();
    };
}

/**
 * Sanitize request body to remove sensitive information
 */
function sanitizeBody(body: any): any {
    if (!body) return body;

    const sanitized = { ...body };

    // Remove password fields
    if (sanitized.password) {
        sanitized.password = '[REDACTED]';
    }
    if (sanitized.passwordHash) {
        sanitized.passwordHash = '[REDACTED]';
    }

    return sanitized;
}

/**
 * Get client IP address from request
 */
function getClientIp(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
        return typeof forwarded === 'string'
            ? forwarded.split(',')[0]
            : forwarded[0];
    }
    return req.socket.remoteAddress || 'unknown';
}
