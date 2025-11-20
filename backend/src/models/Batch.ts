import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { Medicine } from './Medicine';

/**
 * Batch entity for inventory tracking with expiry management
 */
@Entity('batches')
export class Batch {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'medicine_id', type: 'uuid' })
    @Index()
    medicineId!: string;

    @ManyToOne(() => Medicine, (medicine) => medicine.batches, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'medicine_id' })
    medicine!: Medicine;

    @Column({ name: 'batch_number', length: 50 })
    @Index()
    batchNumber!: string;

    @Column({ name: 'manufacture_date', type: 'date' })
    manufactureDate!: Date;

    @Column({ name: 'expiry_date', type: 'date' })
    @Index()
    expiryDate!: Date;

    @Column({ type: 'integer' })
    quantity!: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    mrp!: number;

    @Column({ name: 'cost_price', type: 'decimal', precision: 10, scale: 2 })
    costPrice!: number;

    @Column({ name: 'is_active', default: true })
    isActive!: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;
}
