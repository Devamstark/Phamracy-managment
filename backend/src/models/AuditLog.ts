import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { User } from './User';

/**
 * AuditLog entity for tracking all critical operations
 */
@Entity('audit_logs')
export class AuditLog {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'user_id', type: 'uuid', nullable: true })
    userId?: string;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'user_id' })
    user?: User;

    @Column({ length: 100 })
    @Index()
    action!: string;

    @Column({ name: 'entity_type', length: 50 })
    @Index()
    entityType!: string;

    @Column({ name: 'entity_id', type: 'uuid', nullable: true })
    entityId?: string;

    @Column({ type: 'jsonb', nullable: true })
    details?: any;

    @Column({ name: 'ip_address', length: 45, nullable: true })
    ipAddress?: string;

    @CreateDateColumn({ name: 'timestamp' })
    @Index()
    timestamp!: Date;
}
