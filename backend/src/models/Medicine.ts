import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
    OneToMany,
} from 'typeorm';
import { Batch } from './Batch';
import { ScheduleType } from '../utils/complianceRules';

/**
 * Medicine master data entity
 */
@Entity('medicines')
export class Medicine {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ length: 200 })
    @Index()
    name!: string;

    @Column({ name: 'generic_name', length: 200 })
    @Index()
    genericName!: string;

    @Column({ length: 200 })
    manufacturer!: string;

    @Column({
        name: 'schedule_type',
        type: 'enum',
        enum: ScheduleType,
        default: ScheduleType.OTC,
    })
    @Index()
    scheduleType!: ScheduleType;

    @Column({ name: 'hsn_code', length: 8 })
    hsnCode!: string;

    @Column({ name: 'unit_price', type: 'decimal', precision: 10, scale: 2 })
    unitPrice!: number;

    @Column({ name: 'reorder_level', type: 'integer', default: 10 })
    reorderLevel!: number;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ name: 'is_active', default: true })
    isActive!: boolean;

    @OneToMany(() => Batch, (batch) => batch.medicine)
    batches!: Batch[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;
}
