import { Request, Response, NextFunction } from 'express';
import { InventoryService } from '../services/InventoryService';
import { validate, medicineSchema, updateMedicineSchema, batchSchema } from '../utils/validators';

const inventoryService = new InventoryService();

/**
 * Inventory Controller
 */
export class InventoryController {
    /**
     * Add new medicine
     * POST /api/medicines
     */
    async addMedicine(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { value, error } = validate(medicineSchema, req.body);

            if (error) {
                res.status(400).json({ success: false, message: error });
                return;
            }

            const medicine = await inventoryService.addMedicine(value);

            res.status(201).json({
                success: true,
                message: 'Medicine added successfully',
                data: medicine,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update medicine
     * PUT /api/medicines/:id
     */
    async updateMedicine(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const { value, error } = validate(updateMedicineSchema, req.body);

            if (error) {
                res.status(400).json({ success: false, message: error });
                return;
            }

            const medicine = await inventoryService.updateMedicine(id, value);

            res.json({
                success: true,
                message: 'Medicine updated successfully',
                data: medicine,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get medicine by ID
     * GET /api/medicines/:id
     */
    async getMedicine(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const medicine = await inventoryService.getMedicineById(id);

            res.json({
                success: true,
                data: medicine,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * List medicines
     * GET /api/medicines
     */
    async listMedicines(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page, limit, search, scheduleType } = req.query;

            const result = await inventoryService.listMedicines({
                page: page ? parseInt(page as string) : undefined,
                limit: limit ? parseInt(limit as string) : undefined,
                search: search as string,
                scheduleType: scheduleType as any,
            });

            res.json({
                success: true,
                data: result.medicines,
                pagination: {
                    total: result.total,
                    page: page ? parseInt(page as string) : 1,
                    limit: limit ? parseInt(limit as string) : 20,
                },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Add new batch
     * POST /api/batches
     */
    async addBatch(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { value, error } = validate(batchSchema, req.body);

            if (error) {
                res.status(400).json({ success: false, message: error });
                return;
            }

            const batch = await inventoryService.addBatch(value);

            res.status(201).json({
                success: true,
                message: 'Batch added successfully',
                data: batch,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get available stock for a medicine
     * GET /api/medicines/:id/stock
     */
    async getStock(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const stock = await inventoryService.getAvailableStock(id);

            res.json({
                success: true,
                data: stock,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get low stock alerts
     * GET /api/inventory/alerts/low-stock
     */
    async getLowStockAlerts(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const alerts = await inventoryService.getLowStockAlerts();

            res.json({
                success: true,
                data: alerts,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get expiry alerts
     * GET /api/inventory/alerts/expiry
     */
    async getExpiryAlerts(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { days } = req.query;
            const daysThreshold = days ? parseInt(days as string) : 90;

            const alerts = await inventoryService.getExpiryAlerts(daysThreshold);

            res.json({
                success: true,
                data: alerts,
            });
        } catch (error) {
            next(error);
        }
    }
}
