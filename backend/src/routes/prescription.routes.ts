import { Router } from 'express';
import { PrescriptionController } from '../controllers/PrescriptionController';
import { authenticate } from '../middleware/auth';
import { requirePharmacist } from '../middleware/rbac';
import { auditLogger } from '../middleware/auditLogger';

const router = Router();
const prescriptionController = new PrescriptionController();

/**
 * Prescription routes
 * All routes require authentication and pharmacist role
 */

router.use(authenticate);
router.use(requirePharmacist);

router.post(
    '/upload',
    auditLogger('PRESCRIPTION_UPLOAD', 'Prescription'),
    prescriptionController.uploadPrescription.bind(prescriptionController)
);

router.get('/', prescriptionController.listPrescriptions.bind(prescriptionController));

router.get('/:id', prescriptionController.getPrescription.bind(prescriptionController));

router.get('/:id/parsed', prescriptionController.getParsedPrescription.bind(prescriptionController));

router.post('/verify-doctor', prescriptionController.verifyDoctor.bind(prescriptionController));

export default router;
