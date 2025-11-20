import { Router } from 'express';
import { SalesController } from '../controllers/SalesController';
import { authenticate } from '../middleware/auth';
import { auditLogger } from '../middleware/auditLogger';

const router = Router();
const salesController = new SalesController();

/**
 * Sales routes
 * All routes require authentication
 */

router.use(authenticate);

router.post(
    '/',
    auditLogger('SALE_CREATE', 'Sale'),
    salesController.createSale.bind(salesController)
);

router.get('/', salesController.listSales.bind(salesController));

router.get('/:id', salesController.getSale.bind(salesController));

router.get('/reports/summary', salesController.getSalesReport.bind(salesController));

router.post('/validate-dispensing', salesController.validateDispensing.bind(salesController));

export default router;
