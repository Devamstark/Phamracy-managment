import { Request, Response, NextFunction } from 'express';
import { PrescriptionService } from '../services/PrescriptionService';
import { validate, prescriptionUploadSchema } from '../utils/validators';

const prescriptionService = new PrescriptionService();

/**
 * Prescription Controller
 */
export class PrescriptionController {
    /**
     * Upload FHIR prescription bundle
     * POST /api/prescriptions/upload
     */
    async uploadPrescription(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { value, error } = validate(prescriptionUploadSchema, req.body);

            if (error) {
                res.status(400).json({ success: false, message: error });
                return;
            }

            const prescription = await prescriptionService.uploadPrescription((value as any).fhirBundle);

            res.status(201).json({
                success: true,
                message: 'Prescription uploaded successfully',
                data: prescription,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get prescription by ID
     * GET /api/prescriptions/:id
     */
    async getPrescription(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const prescription = await prescriptionService.getPrescriptionById(id);

            res.json({
                success: true,
                data: prescription,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get parsed prescription data
     * GET /api/prescriptions/:id/parsed
     */
    async getParsedPrescription(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const parsed = await prescriptionService.getParsedPrescription(id);

            res.json({
                success: true,
                data: parsed,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * List prescriptions
     * GET /api/prescriptions
     */
    async listPrescriptions(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { page, limit, patientName, doctorName, startDate, endDate } = req.query;

            const result = await prescriptionService.listPrescriptions({
                page: page ? parseInt(page as string) : undefined,
                limit: limit ? parseInt(limit as string) : undefined,
                patientName: patientName as string,
                doctorName: doctorName as string,
                startDate: startDate ? new Date(startDate as string) : undefined,
                endDate: endDate ? new Date(endDate as string) : undefined,
            });

            res.json({
                success: true,
                data: result.prescriptions,
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
     * Verify doctor credentials
     * POST /api/prescriptions/verify-doctor
     */
    async verifyDoctor(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { registrationNumber } = req.body;

            if (!registrationNumber) {
                res.status(400).json({
                    success: false,
                    message: 'Registration number is required',
                });
                return;
            }

            const result = await prescriptionService.verifyDoctor(registrationNumber);

            res.json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }
}
