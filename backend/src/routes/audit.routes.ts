import { Router } from 'express';
import { AuditController } from '../controllers/AuditController';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/rbac';

const router = Router();
const auditController = new AuditController();

/**
 * Audit routes
 * All routes require authentication and admin role
 */

router.use(authenticate);
router.use(requireAdmin);

router.get('/', auditController.queryLogs.bind(auditController));

export default router;
