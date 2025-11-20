import { Router } from 'express';
import authRoutes from './auth.routes';
import prescriptionRoutes from './prescription.routes';
import inventoryRoutes from './inventory.routes';
import salesRoutes from './sales.routes';
import auditRoutes from './audit.routes';

const router = Router();

/**
 * Main API router
 * Aggregates all route modules
 */

router.use('/auth', authRoutes);
router.use('/prescriptions', prescriptionRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/sales', salesRoutes);
router.use('/audit', auditRoutes);

// Health check endpoint
router.get('/health', (_req, res) => {
    res.json({
        success: true,
        message: 'Pharmacy eRx API is running',
        timestamp: new Date().toISOString(),
    });
});

export default router;
