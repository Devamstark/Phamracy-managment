import { AppDataSource } from '../config/database';
import { Medicine } from '../models/Medicine';
import { Batch } from '../models/Batch';
import { AppError } from '../middleware/errorHandler';
import { ScheduleType } from '../utils/complianceRules';
import logger from '../utils/logger';

/**
 * Inventory Service for managing medicines and stock
 */
export class InventoryService {
    private medicineRepository = AppDataSource.getRepository(Medicine);
    private batchRepository = AppDataSource.getRepository(Batch);

    /**
     * Add new medicine
     */
    async addMedicine(medicineData: {
        name: string;
        genericName: string;
        manufacturer: string;
        scheduleType: ScheduleType;
        hsnCode: string;
        unitPrice: number;
        reorderLevel: number;
        description?: string;
    }): Promise<Medicine> {
        const medicine = this.medicineRepository.create(medicineData);
        await this.medicineRepository.save(medicine);
        logger.info(`Medicine added: ${medicine.name} (${medicine.id})`);
        return medicine;
    }

    /**
     * Update medicine
     */
    async updateMedicine(id: string, updates: Partial<Medicine>): Promise<Medicine> {
        const medicine = await this.medicineRepository.findOne({ where: { id } });

        if (!medicine) {
            throw new AppError('Medicine not found', 404);
        }

        Object.assign(medicine, updates);
        await this.medicineRepository.save(medicine);

        logger.info(`Medicine updated: ${medicine.name} (${medicine.id})`);
        return medicine;
    }

    /**
     * Get medicine by ID
     */
    async getMedicineById(id: string): Promise<Medicine> {
        const medicine = await this.medicineRepository.findOne({
            where: { id },
            relations: ['batches'],
        });

        if (!medicine) {
            throw new AppError('Medicine not found', 404);
        }

        return medicine;
    }

    /**
     * List medicines with filters
     */
    async listMedicines(filters: {
        page?: number;
        limit?: number;
        search?: string;
        scheduleType?: ScheduleType;
    }): Promise<{ medicines: Medicine[]; total: number }> {
        const page = filters.page || 1;
        const limit = filters.limit || 20;
        const skip = (page - 1) * limit;

        const queryBuilder = this.medicineRepository.createQueryBuilder('medicine');

        queryBuilder.where('medicine.is_active = :isActive', { isActive: true });

        if (filters.search) {
            queryBuilder.andWhere(
                '(medicine.name ILIKE :search OR medicine.generic_name ILIKE :search)',
                { search: `%${filters.search}%` }
            );
        }

        if (filters.scheduleType) {
            queryBuilder.andWhere('medicine.schedule_type = :scheduleType', {
                scheduleType: filters.scheduleType,
            });
        }

        queryBuilder.orderBy('medicine.name', 'ASC');
        queryBuilder.skip(skip).take(limit);

        const [medicines, total] = await queryBuilder.getManyAndCount();

        return { medicines, total };
    }

    /**
     * Add new batch
     */
    async addBatch(batchData: {
        medicineId: string;
        batchNumber: string;
        manufactureDate: Date;
        expiryDate: Date;
        quantity: number;
        mrp: number;
        costPrice: number;
    }): Promise<Batch> {
        // Verify medicine exists
        const medicine = await this.getMedicineById(batchData.medicineId);

        const batch = this.batchRepository.create(batchData);
        await this.batchRepository.save(batch);

        logger.info(`Batch added: ${batch.batchNumber} for ${medicine.name}`);
        return batch;
    }

    /**
     * Get available stock for a medicine
     */
    async getAvailableStock(medicineId: string): Promise<{
        totalQuantity: number;
        batches: Batch[];
    }> {
        const batches = await this.batchRepository.find({
            where: {
                medicineId,
                isActive: true,
            },
            order: {
                expiryDate: 'ASC', // FIFO by expiry date
            },
        });

        // Filter out expired batches
        const now = new Date();
        const validBatches = batches.filter((batch) => new Date(batch.expiryDate) > now);

        const totalQuantity = validBatches.reduce((sum, batch) => sum + batch.quantity, 0);

        return {
            totalQuantity,
            batches: validBatches,
        };
    }

    /**
     * Update batch quantity (for stock adjustments)
     */
    async updateBatchQuantity(batchId: string, quantity: number): Promise<Batch> {
        const batch = await this.batchRepository.findOne({ where: { id: batchId } });

        if (!batch) {
            throw new AppError('Batch not found', 404);
        }

        batch.quantity = quantity;
        await this.batchRepository.save(batch);

        logger.info(`Batch quantity updated: ${batch.batchNumber} -> ${quantity}`);
        return batch;
    }

    /**
     * Get low stock alerts
     */
    async getLowStockAlerts(): Promise<
        Array<{
            medicine: Medicine;
            currentStock: number;
            reorderLevel: number;
        }>
    > {
        const medicines = await this.medicineRepository.find({
            where: { isActive: true },
        });

        const alerts = [];

        for (const medicine of medicines) {
            const stock = await this.getAvailableStock(medicine.id);

            if (stock.totalQuantity <= medicine.reorderLevel) {
                alerts.push({
                    medicine,
                    currentStock: stock.totalQuantity,
                    reorderLevel: medicine.reorderLevel,
                });
            }
        }

        return alerts;
    }

    /**
     * Get expiry alerts
     */
    async getExpiryAlerts(daysThreshold: number = 90): Promise<
        Array<{
            batch: Batch;
            medicine: Medicine;
            daysUntilExpiry: number;
        }>
    > {
        const now = new Date();
        const thresholdDate = new Date();
        thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

        const batches = await this.batchRepository
            .createQueryBuilder('batch')
            .leftJoinAndSelect('batch.medicine', 'medicine')
            .where('batch.is_active = :isActive', { isActive: true })
            .andWhere('batch.expiry_date > :now', { now })
            .andWhere('batch.expiry_date <= :threshold', { threshold: thresholdDate })
            .andWhere('batch.quantity > 0')
            .orderBy('batch.expiry_date', 'ASC')
            .getMany();

        return batches.map((batch) => {
            const daysUntilExpiry = Math.floor(
                (new Date(batch.expiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
            );

            return {
                batch,
                medicine: batch.medicine,
                daysUntilExpiry,
            };
        });
    }

    /**
     * Reduce stock (FIFO - First In First Out by expiry date)
     */
    async reduceStock(
        medicineId: string,
        quantity: number
    ): Promise<{ batches: Array<{ batchId: string; quantity: number }> }> {
        const stock = await this.getAvailableStock(medicineId);

        if (stock.totalQuantity < quantity) {
            throw new AppError('Insufficient stock', 400);
        }

        const usedBatches: Array<{ batchId: string; quantity: number }> = [];
        let remainingQuantity = quantity;

        for (const batch of stock.batches) {
            if (remainingQuantity <= 0) break;

            const quantityToUse = Math.min(batch.quantity, remainingQuantity);

            batch.quantity -= quantityToUse;
            await this.batchRepository.save(batch);

            usedBatches.push({
                batchId: batch.id,
                quantity: quantityToUse,
            });

            remainingQuantity -= quantityToUse;
        }

        return { batches: usedBatches };
    }
}
