import { AppDataSource } from '../config/database';
import { Prescription } from '../models/Prescription';
import { FHIRService, ParsedPrescription } from './FHIRService';
import { AppError } from '../middleware/errorHandler';
import { validateDoctorRegistration } from '../utils/complianceRules';
import logger from '../utils/logger';
import fs from 'fs';
import path from 'path';

/**
 * Prescription Service for managing e-prescriptions
 */
export class PrescriptionService {
    private prescriptionRepository = AppDataSource.getRepository(Prescription);
    private fhirService = new FHIRService();

    /**
     * Upload and process FHIR prescription bundle
     */
    async uploadPrescription(fhirBundle: any): Promise<Prescription> {
        try {
            // Validate FHIR bundle structure
            const validation = this.fhirService.validateBundle(fhirBundle);
            if (!validation.valid) {
                throw new AppError(
                    `Invalid FHIR bundle: ${validation.errors.join(', ')}`,
                    400
                );
            }

            // Parse FHIR bundle
            const parsed = this.fhirService.parseFHIRBundle(fhirBundle);

            // Validate doctor registration
            const doctorValidation = validateDoctorRegistration(parsed.doctorRegistration);

            // Create prescription record
            const prescription = this.prescriptionRepository.create({
                fhirBundle,
                doctorName: parsed.doctorName,
                doctorRegistration: parsed.doctorRegistration,
                doctorVerified: doctorValidation.valid,
                patientName: parsed.patientName,
                patientId: parsed.patientId,
                prescriptionDate: parsed.prescriptionDate,
            });

            await this.prescriptionRepository.save(prescription);

            // Store FHIR bundle as JSON file
            await this.storePrescriptionFile(prescription.id, fhirBundle);

            logger.info(`Prescription uploaded: ${prescription.id}`);

            return prescription;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            logger.error('Error uploading prescription:', error);
            throw new AppError('Failed to upload prescription', 500);
        }
    }

    /**
     * Get prescription by ID
     */
    async getPrescriptionById(id: string): Promise<Prescription> {
        const prescription = await this.prescriptionRepository.findOne({
            where: { id },
        });

        if (!prescription) {
            throw new AppError('Prescription not found', 404);
        }

        return prescription;
    }

    /**
     * Get parsed prescription data
     */
    async getParsedPrescription(id: string): Promise<ParsedPrescription> {
        const prescription = await this.getPrescriptionById(id);
        return this.fhirService.parseFHIRBundle(prescription.fhirBundle);
    }

    /**
     * List prescriptions with filters
     */
    async listPrescriptions(filters: {
        page?: number;
        limit?: number;
        patientName?: string;
        doctorName?: string;
        startDate?: Date;
        endDate?: Date;
    }): Promise<{ prescriptions: Prescription[]; total: number }> {
        const page = filters.page || 1;
        const limit = filters.limit || 20;
        const skip = (page - 1) * limit;

        const queryBuilder = this.prescriptionRepository.createQueryBuilder('prescription');

        if (filters.patientName) {
            queryBuilder.andWhere('prescription.patient_name ILIKE :patientName', {
                patientName: `%${filters.patientName}%`,
            });
        }

        if (filters.doctorName) {
            queryBuilder.andWhere('prescription.doctor_name ILIKE :doctorName', {
                doctorName: `%${filters.doctorName}%`,
            });
        }

        if (filters.startDate) {
            queryBuilder.andWhere('prescription.prescription_date >= :startDate', {
                startDate: filters.startDate,
            });
        }

        if (filters.endDate) {
            queryBuilder.andWhere('prescription.prescription_date <= :endDate', {
                endDate: filters.endDate,
            });
        }

        queryBuilder.orderBy('prescription.created_at', 'DESC');
        queryBuilder.skip(skip).take(limit);

        const [prescriptions, total] = await queryBuilder.getManyAndCount();

        return { prescriptions, total };
    }

    /**
     * Verify doctor credentials (mock implementation)
     * In production, this would call ABDM/NDHM API
     */
    async verifyDoctor(registrationNumber: string): Promise<{
        verified: boolean;
        councilType?: string;
        error?: string;
    }> {
        const validation = validateDoctorRegistration(registrationNumber);

        // In production, make API call to medical council registry
        // For now, we just validate the format
        return {
            verified: validation.valid,
            councilType: validation.councilType,
            error: validation.error,
        };
    }

    /**
     * Store prescription FHIR bundle as file
     */
    private async storePrescriptionFile(
        prescriptionId: string,
        fhirBundle: any
    ): Promise<void> {
        try {
            const storageDir =
                process.env.PRESCRIPTION_STORAGE_DIR || './uploads/prescriptions';

            // Create directory if it doesn't exist
            if (!fs.existsSync(storageDir)) {
                fs.mkdirSync(storageDir, { recursive: true });
            }

            const filename = `prescription_${prescriptionId}.json`;
            const filepath = path.join(storageDir, filename);

            // Write FHIR bundle to file
            fs.writeFileSync(filepath, JSON.stringify(fhirBundle, null, 2));

            // Update prescription record with file path
            await this.prescriptionRepository.update(prescriptionId, {
                storedFilePath: filepath,
            });

            logger.info(`Prescription file stored: ${filepath}`);
        } catch (error) {
            logger.error('Error storing prescription file:', error);
            // Don't throw error - file storage is not critical
        }
    }
}
