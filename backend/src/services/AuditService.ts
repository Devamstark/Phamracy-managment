import { AppDataSource } from '../config/database';
import { AuditLog } from '../models/AuditLog';

/**
 * Audit Service for querying audit logs
 */
export class AuditService {
    private auditLogRepository = AppDataSource.getRepository(AuditLog);

    /**
     * Create audit log entry
     */
    async createLog(logData: {
        userId?: string;
        action: string;
        entityType: string;
        entityId?: string;
        details?: any;
        ipAddress?: string;
    }): Promise<AuditLog> {
        const auditLog = this.auditLogRepository.create(logData);
        await this.auditLogRepository.save(auditLog);
        return auditLog;
    }

    /**
     * Query audit logs with filters
     */
    async queryLogs(filters: {
        page?: number;
        limit?: number;
        userId?: string;
        action?: string;
        entityType?: string;
        startDate?: Date;
        endDate?: Date;
    }): Promise<{ logs: AuditLog[]; total: number }> {
        const page = filters.page || 1;
        const limit = filters.limit || 50;
        const skip = (page - 1) * limit;

        const queryBuilder = this.auditLogRepository.createQueryBuilder('log');
        queryBuilder.leftJoinAndSelect('log.user', 'user');

        if (filters.userId) {
            queryBuilder.andWhere('log.user_id = :userId', { userId: filters.userId });
        }

        if (filters.action) {
            queryBuilder.andWhere('log.action = :action', { action: filters.action });
        }

        if (filters.entityType) {
            queryBuilder.andWhere('log.entity_type = :entityType', {
                entityType: filters.entityType,
            });
        }

        if (filters.startDate) {
            queryBuilder.andWhere('log.timestamp >= :startDate', {
                startDate: filters.startDate,
            });
        }

        if (filters.endDate) {
            queryBuilder.andWhere('log.timestamp <= :endDate', {
                endDate: filters.endDate,
            });
        }

        queryBuilder.orderBy('log.timestamp', 'DESC');
        queryBuilder.skip(skip).take(limit);

        const [logs, total] = await queryBuilder.getManyAndCount();

        return { logs, total };
    }
}
