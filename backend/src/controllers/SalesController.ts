import { Response, NextFunction } from 'express';
import { BillingService } from '../services/BillingService';
import { AuthRequest } from '../middleware/auth';
import { validate, saleSchema } from '../utils/validators';

const billingService = new BillingService();

/**
 * Sales Controller
 */
export class SalesController {
    /**
     * Create new sale
     * POST /api/sales
     */
    async createSale(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.userId) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required',
                });
                return;
            }

            const { value, error } = validate(saleSchema, req.body);

            if (error) {
                res.status(400).json({ success: false, message: error });
                return;
            }

            const sale = await billingService.createSale({
                ...value,
                createdById: req.userId,
            });

            res.status(201).json({
                success: true,
                message: 'Sale created successfully',
                data: sale,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get sale by ID
     * GET /api/sales/:id
     */
    async getSale(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const sale = await billingService.getSaleById(id);

            res.json({
                success: true,
                data: sale,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * List sales
     * GET /api/sales
     */
    async listSales(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page, limit, startDate, endDate } = req.query;

            const result = await billingService.listSales({
                page: page ? parseInt(page as string) : undefined,
                limit: limit ? parseInt(limit as string) : undefined,
                startDate: startDate ? new Date(startDate as string) : undefined,
                endDate: endDate ? new Date(endDate as string) : undefined,
            });

            res.json({
                success: true,
                data: result.sales,
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
     * Get sales report
     * GET /api/sales/reports/summary
     */
    async getSalesReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { startDate, endDate } = req.query;

            if (!startDate || !endDate) {
                res.status(400).json({
                    success: false,
                    message: 'Start date and end date are required',
                });
                return;
            }

            const report = await billingService.getSalesReport(
                new Date(startDate as string),
                new Date(endDate as string)
            );

            res.json({
                success: true,
                data: report,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Validate dispensing compliance
     * POST /api/sales/validate-dispensing
     */
    async validateDispensing(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const { medicineId, quantity, prescriptionId } = req.body;

            if (!medicineId || !quantity) {
                res.status(400).json({
                    success: false,
                    message: 'Medicine ID and quantity are required',
                });
                return;
            }

            const validation = await billingService.validateDispensing(
                medicineId,
                quantity,
                prescriptionId
            );

            res.json({
                success: true,
                data: validation,
            });
        } catch (error) {
            next(error);
        }
    }
}
