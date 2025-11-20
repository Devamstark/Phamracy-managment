import { Router } from 'express';
import { InventoryController } from '../controllers/InventoryController';
import { authenticate } from '../middleware/auth';
import { requirePharmacist } from '../middleware/rbac';
import { auditLogger } from '../middleware/auditLogger';

const router = Router();
const inventoryController = new InventoryController();

/**
 * Inventory routes
 * All routes require authentication
 */

router.use(authenticate);

// Medicine routes
router.post(
    '/medicines',
    requirePharmacist,
    auditLogger('MEDICINE_CREATE', 'Medicine'),
    inventoryController.addMedicine.bind(inventoryController)
);

router.put(
    '/medicines/:id',
    requirePharmacist,
    auditLogger('MEDICINE_UPDATE', 'Medicine'),
    inventoryController.updateMedicine.bind(inventoryController)
);

router.get('/medicines', inventoryController.listMedicines.bind(inventoryController));

router.get('/medicines/:id', inventoryController.getMedicine.bind(inventoryController));

router.get('/medicines/:id/stock', inventoryController.getStock.bind(inventoryController));

// Batch routes
router.post(
    '/batches',
    requirePharmacist,
    auditLogger('BATCH_CREATE', 'Batch'),
    inventoryController.addBatch.bind(inventoryController)
);

// Alert routes
router.get('/alerts/low-stock', inventoryController.getLowStockAlerts.bind(inventoryController));

router.get('/alerts/expiry', inventoryController.getExpiryAlerts.bind(inventoryController));

export default router;
