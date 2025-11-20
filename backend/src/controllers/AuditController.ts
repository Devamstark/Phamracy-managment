import { Request, Response, NextFunction } from 'express';
import { AuditService } from '../services/AuditService';

const auditService = new AuditService();

/**
 * Audit Controller
 */
export class AuditController {
    /**
     * Query audit logs
     * GET /api/audit
     */
    async queryLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page, limit, userId, action, entityType, startDate, endDate } = req.query;

            const result = await auditService.queryLogs({
                page: page ? parseInt(page as string) : undefined,
                limit: limit ? parseInt(limit as string) : undefined,
                userId: userId as string,
                action: action as string,
                entityType: entityType as string,
                startDate: startDate ? new Date(startDate as string) : undefined,
                endDate: endDate ? new Date(endDate as string) : undefined,
            });

            res.json({
                success: true,
                data: result.logs,
                pagination: {
                    total: result.total,
                    page: page ? parseInt(page as string) : 1,
                    limit: limit ? parseInt(limit as string) : 50,
                },
            });
        } catch (error) {
            next(error);
        }
    }
}
