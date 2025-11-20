import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Sale } from './Sale';
import { Medicine } from './Medicine';
import { Batch } from './Batch';

/**
 * SaleItem entity for individual items in a sale
 */
@Entity('sale_items')
export class SaleItem {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'sale_id', type: 'uuid' })
    saleId!: string;

    @ManyToOne(() => Sale, (sale) => sale.items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'sale_id' })
    sale!: Sale;

    @Column({ name: 'medicine_id', type: 'uuid' })
    medicineId!: string;

    @ManyToOne(() => Medicine)
    @JoinColumn({ name: 'medicine_id' })
    medicine!: Medicine;

    @Column({ name: 'batch_id', type: 'uuid' })
    batchId!: string;

    @ManyToOne(() => Batch)
    @JoinColumn({ name: 'batch_id' })
    batch!: Batch;

    @Column({ type: 'integer' })
    quantity!: number;

    @Column({ name: 'unit_price', type: 'decimal', precision: 10, scale: 2 })
    unitPrice!: number;

    @Column({ name: 'gst_rate', type: 'decimal', precision: 5, scale: 2 })
    gstRate!: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    total!: number;
}
