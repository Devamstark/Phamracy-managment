import { AppDataSource } from '../config/database';
import { Sale, PaymentMethod } from '../models/Sale';
import { SaleItem } from '../models/SaleItem';
import { Medicine } from '../models/Medicine';
import { Batch } from '../models/Batch';
import { InventoryService } from './InventoryService';
import { AppError } from '../middleware/errorHandler';
import { getGSTRate, canDispenseMedicine, ScheduleType } from '../utils/complianceRules';
import logger from '../utils/logger';

export interface SaleItemInput {
    medicineId: string;
    batchId: string;
    quantity: number;
}

/**
 * Billing Service for sales and dispensing
 */
export class BillingService {
    private saleRepository = AppDataSource.getRepository(Sale);
    private saleItemRepository = AppDataSource.getRepository(SaleItem);
    private medicineRepository = AppDataSource.getRepository(Medicine);
    private batchRepository = AppDataSource.getRepository(Batch);
    private inventoryService = new InventoryService();

    /**
     * Create a new sale
     */
    async createSale(saleData: {
        prescriptionId?: string;
        customerName?: string;
        items: SaleItemInput[];
        discount?: number;
        paymentMethod?: PaymentMethod;
        createdById: string;
    }): Promise<Sale> {
        // Validate items
        if (!saleData.items || saleData.items.length === 0) {
            throw new AppError('Sale must have at least one item', 400);
        }

        // Start transaction
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Calculate totals
            const { items, subtotal, gstAmount, totalAmount } = await this.calculateSaleTotals(
                saleData.items,
                saleData.discount || 0
            );

            // Generate invoice number
            const invoiceNumber = await this.generateInvoiceNumber();

            // Create sale record
            const sale = this.saleRepository.create({
                invoiceNumber,
                prescriptionId: saleData.prescriptionId,
                customerName: saleData.customerName,
                totalAmount,
                gstAmount,
                discount: saleData.discount || 0,
                paymentMethod: saleData.paymentMethod || PaymentMethod.CASH,
                createdById: saleData.createdById,
            });

            await queryRunner.manager.save(sale);

            // Create sale items
            for (const item of items) {
                const saleItem = this.saleItemRepository.create({
                    saleId: sale.id,
                    medicineId: item.medicineId,
                    batchId: item.batchId,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    gstRate: item.gstRate,
                    total: item.total,
                });

                await queryRunner.manager.save(saleItem);

                // Reduce stock
                const batch = await queryRunner.manager.findOne(Batch, {
                    where: { id: item.batchId },
                });

                if (!batch) {
                    throw new AppError(`Batch not found: ${item.batchId}`, 404);
                }

                if (batch.quantity < item.quantity) {
                    throw new AppError(
                        `Insufficient stock in batch ${batch.batchNumber}`,
                        400
                    );
                }

                batch.quantity -= item.quantity;
                await queryRunner.manager.save(batch);
            }

            await queryRunner.commitTransaction();

            logger.info(`Sale created: ${sale.invoiceNumber} - Total: ₹${totalAmount}`);

            // Load sale with items
            const completeSale = await this.saleRepository.findOne({
                where: { id: sale.id },
                relations: ['items', 'items.medicine', 'items.batch', 'prescription'],
            });

            return completeSale!;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            logger.error('Error creating sale:', error);
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * Calculate sale totals
     */
    private async calculateSaleTotals(
        items: SaleItemInput[],
        discountPercent: number
    ): Promise<{
        items: Array<{
            medicineId: string;
            batchId: string;
            quantity: number;
            unitPrice: number;
            gstRate: number;
            total: number;
        }>;
        subtotal: number;
        gstAmount: number;
        totalAmount: number;
    }> {
        const calculatedItems = [];
        let subtotal = 0;
        let totalGst = 0;

        for (const item of items) {
            // Get medicine and batch
            const medicine = await this.medicineRepository.findOne({
                where: { id: item.medicineId },
            });

            if (!medicine) {
                throw new AppError(`Medicine not found: ${item.medicineId}`, 404);
            }

            const batch = await this.batchRepository.findOne({
                where: { id: item.batchId },
            });

            if (!batch) {
                throw new AppError(`Batch not found: ${item.batchId}`, 404);
            }

            // Check if batch belongs to medicine
            if (batch.medicineId !== medicine.id) {
                throw new AppError('Batch does not belong to the specified medicine', 400);
            }

            // Get GST rate
            const gstRate = getGSTRate(medicine.hsnCode);

            // Calculate item total
            const unitPrice = batch.mrp;
            const itemSubtotal = unitPrice * item.quantity;
            const itemGst = (itemSubtotal * gstRate) / 100;
            const itemTotal = itemSubtotal + itemGst;

            calculatedItems.push({
                medicineId: item.medicineId,
                batchId: item.batchId,
                quantity: item.quantity,
                unitPrice,
                gstRate,
                total: itemTotal,
            });

            subtotal += itemSubtotal;
            totalGst += itemGst;
        }

        // Apply discount
        const discountAmount = (subtotal * discountPercent) / 100;
        const finalSubtotal = subtotal - discountAmount;

        // Recalculate GST after discount
        const finalGst = (totalGst * (100 - discountPercent)) / 100;
        const totalAmount = finalSubtotal + finalGst;

        return {
            items: calculatedItems,
            subtotal: finalSubtotal,
            gstAmount: finalGst,
            totalAmount,
        };
    }

    /**
     * Generate unique invoice number
     */
    private async generateInvoiceNumber(): Promise<string> {
        const prefix = 'INV';
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');

        // Get count of sales today
        const startOfDay = new Date(date.setHours(0, 0, 0, 0));
        const count = await this.saleRepository.count({
            where: {
                createdAt: AppDataSource.getRepository(Sale)
                    .createQueryBuilder()
                    .where('created_at >= :startOfDay', { startOfDay })
                    .getQuery() as any,
            },
        });

        const sequence = (count + 1).toString().padStart(4, '0');

        return `${prefix}${year}${month}${sequence}`;
    }

    /**
     * Get sale by ID
     */
    async getSaleById(id: string): Promise<Sale> {
        const sale = await this.saleRepository.findOne({
            where: { id },
            relations: ['items', 'items.medicine', 'items.batch', 'prescription', 'createdBy'],
        });

        if (!sale) {
            throw new AppError('Sale not found', 404);
        }

        return sale;
    }

    /**
     * List sales with filters
     */
    async listSales(filters: {
        page?: number;
        limit?: number;
        startDate?: Date;
        endDate?: Date;
    }): Promise<{ sales: Sale[]; total: number }> {
        const page = filters.page || 1;
        const limit = filters.limit || 20;
        const skip = (page - 1) * limit;

        const queryBuilder = this.saleRepository.createQueryBuilder('sale');

        if (filters.startDate) {
            queryBuilder.andWhere('sale.created_at >= :startDate', {
                startDate: filters.startDate,
            });
        }

        if (filters.endDate) {
            queryBuilder.andWhere('sale.created_at <= :endDate', {
                endDate: filters.endDate,
            });
        }

        queryBuilder.orderBy('sale.created_at', 'DESC');
        queryBuilder.skip(skip).take(limit);

        const [sales, total] = await queryBuilder.getManyAndCount();

        return { sales, total };
    }

    /**
     * Get sales report
     */
    async getSalesReport(startDate: Date, endDate: Date): Promise<{
        totalSales: number;
        totalRevenue: number;
        totalGst: number;
        itemsSold: number;
    }> {
        const queryBuilder = this.saleRepository.createQueryBuilder('sale');

        queryBuilder
            .select('COUNT(sale.id)', 'totalSales')
            .addSelect('SUM(sale.total_amount)', 'totalRevenue')
            .addSelect('SUM(sale.gst_amount)', 'totalGst')
            .where('sale.created_at >= :startDate', { startDate })
            .andWhere('sale.created_at <= :endDate', { endDate });

        const result = await queryBuilder.getRawOne();

        // Get total items sold
        const itemsResult = await this.saleItemRepository
            .createQueryBuilder('item')
            .select('SUM(item.quantity)', 'itemsSold')
            .innerJoin('item.sale', 'sale')
            .where('sale.created_at >= :startDate', { startDate })
            .andWhere('sale.created_at <= :endDate', { endDate })
            .getRawOne();

        return {
            totalSales: parseInt(result.totalSales) || 0,
            totalRevenue: parseFloat(result.totalRevenue) || 0,
            totalGst: parseFloat(result.totalGst) || 0,
            itemsSold: parseInt(itemsResult.itemsSold) || 0,
        };
    }

    /**
     * Validate dispensing compliance
     */
    async validateDispensing(
        medicineId: string,
        quantity: number,
        prescriptionId?: string
    ): Promise<{ allowed: boolean; warnings: string[]; errors: string[] }> {
        const medicine = await this.medicineRepository.findOne({
            where: { id: medicineId },
        });

        if (!medicine) {
            throw new AppError('Medicine not found', 404);
        }

        const hasPrescription = !!prescriptionId;
        const isDoctorVerified = hasPrescription; // Simplified - in production, check prescription.doctorVerified

        return canDispenseMedicine(
            medicine.scheduleType,
            hasPrescription,
            isDoctorVerified,
            quantity
        );
    }
}
