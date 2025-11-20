import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
    Index,
} from 'typeorm';
import { User } from './User';
import { Prescription } from './Prescription';
import { SaleItem } from './SaleItem';

export enum PaymentMethod {
    CASH = 'CASH',
    CARD = 'CARD',
    UPI = 'UPI',
    INSURANCE = 'INSURANCE',
}

/**
 * Sale entity for billing and dispensing records
 */
@Entity('sales')
export class Sale {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'invoice_number', unique: true, length: 50 })
    @Index()
    invoiceNumber!: string;

    @Column({ name: 'prescription_id', type: 'uuid', nullable: true })
    prescriptionId?: string;

    @ManyToOne(() => Prescription, { nullable: true })
    @JoinColumn({ name: 'prescription_id' })
    prescription?: Prescription;

    @Column({ name: 'customer_name', length: 200, nullable: true })
    customerName?: string;

    @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2 })
    totalAmount!: number;

    @Column({ name: 'gst_amount', type: 'decimal', precision: 10, scale: 2 })
    gstAmount!: number;

    @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
    discount!: number;

    @Column({
        name: 'payment_method',
        type: 'enum',
        enum: PaymentMethod,
        default: PaymentMethod.CASH,
    })
    paymentMethod!: PaymentMethod;

    @Column({ name: 'created_by', type: 'uuid' })
    createdById!: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'created_by' })
    createdBy!: User;

    @OneToMany(() => SaleItem, (saleItem) => saleItem.sale, { cascade: true })
    items!: SaleItem[];

    @Column({ name: 'invoice_path', length: 500, nullable: true })
    invoicePath?: string;

    @CreateDateColumn({ name: 'created_at' })
    @Index()
    createdAt!: Date;
}
