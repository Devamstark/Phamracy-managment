import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

/**
 * FHIR R4 Bundle structure interfaces (ABDM/NDHM compliant)
 */
export interface FHIRBundle {
    resourceType: 'Bundle';
    type: string;
    entry?: FHIRBundleEntry[];
}

export interface FHIRBundleEntry {
    resource: FHIRResource;
}

export interface FHIRResource {
    resourceType: string;
    [key: string]: any;
}

export interface MedicationRequest {
    resourceType: 'MedicationRequest';
    id?: string;
    status: string;
    intent: string;
    medicationCodeableConcept?: {
        coding?: Array<{
            system?: string;
            code?: string;
            display?: string;
        }>;
        text?: string;
    };
    subject?: {
        reference?: string;
        display?: string;
    };
    requester?: {
        reference?: string;
        display?: string;
    };
    dosageInstruction?: Array<{
        text?: string;
        timing?: any;
        doseAndRate?: Array<{
            doseQuantity?: {
                value?: number;
                unit?: string;
            };
        }>;
    }>;
    dispenseRequest?: {
        quantity?: {
            value?: number;
            unit?: string;
        };
        expectedSupplyDuration?: {
            value?: number;
            unit?: string;
        };
    };
    authoredOn?: string;
}

export interface Practitioner {
    resourceType: 'Practitioner';
    id?: string;
    identifier?: Array<{
        system?: string;
        value?: string;
    }>;
    name?: Array<{
        text?: string;
        family?: string;
        given?: string[];
    }>;
    qualification?: Array<{
        code?: {
            coding?: Array<{
                system?: string;
                code?: string;
                display?: string;
            }>;
        };
    }>;
}

export interface Patient {
    resourceType: 'Patient';
    id?: string;
    identifier?: Array<{
        system?: string;
        value?: string;
    }>;
    name?: Array<{
        text?: string;
        family?: string;
        given?: string[];
    }>;
    gender?: string;
    birthDate?: string;
}

/**
 * Parsed prescription data
 */
export interface ParsedPrescription {
    patientName: string;
    patientId?: string;
    doctorName: string;
    doctorRegistration: string;
    prescriptionDate: Date;
    medications: ParsedMedication[];
}

export interface ParsedMedication {
    name: string;
    code?: string;
    dosage?: string;
    quantity?: number;
    duration?: number;
    instructions?: string;
}

/**
 * FHIR Service for parsing ABDM/NDHM compliant e-prescriptions
 */
export class FHIRService {
    /**
     * Parse FHIR R4 Bundle and extract prescription data
     */
    parseFHIRBundle(bundle: any): ParsedPrescription {
        try {
            // Validate bundle structure
            if (!bundle || bundle.resourceType !== 'Bundle') {
                throw new AppError('Invalid FHIR bundle: resourceType must be Bundle', 400);
            }

            if (!bundle.entry || !Array.isArray(bundle.entry)) {
                throw new AppError('Invalid FHIR bundle: missing or invalid entries', 400);
            }

            // Extract resources
            const resources = bundle.entry.map((entry: FHIRBundleEntry) => entry.resource);

            // Find patient
            const patient = resources.find((r: FHIRResource) => r.resourceType === 'Patient') as Patient;
            if (!patient) {
                throw new AppError('Patient resource not found in FHIR bundle', 400);
            }

            // Find practitioner (doctor)
            const practitioner = resources.find(
                (r: FHIRResource) => r.resourceType === 'Practitioner'
            ) as Practitioner;
            if (!practitioner) {
                throw new AppError('Practitioner resource not found in FHIR bundle', 400);
            }

            // Find medication requests
            const medicationRequests = resources.filter(
                (r: FHIRResource) => r.resourceType === 'MedicationRequest'
            ) as MedicationRequest[];

            if (medicationRequests.length === 0) {
                throw new AppError('No medication requests found in FHIR bundle', 400);
            }

            // Parse patient data
            const patientName = this.extractPatientName(patient);
            const patientId = this.extractPatientId(patient);

            // Parse practitioner data
            const doctorName = this.extractPractitionerName(practitioner);
            const doctorRegistration = this.extractDoctorRegistration(practitioner);

            // Parse medications
            const medications = medicationRequests.map((mr) => this.parseMedicationRequest(mr));

            // Get prescription date (from first medication request)
            const prescriptionDate = medicationRequests[0].authoredOn
                ? new Date(medicationRequests[0].authoredOn)
                : new Date();

            return {
                patientName,
                patientId,
                doctorName,
                doctorRegistration,
                prescriptionDate,
                medications,
            };
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            logger.error('Error parsing FHIR bundle:', error);
            throw new AppError('Failed to parse FHIR bundle: ' + (error as Error).message, 400);
        }
    }

    /**
     * Extract patient name from Patient resource
     */
    private extractPatientName(patient: Patient): string {
        if (patient.name && patient.name.length > 0) {
            const name = patient.name[0];
            if (name.text) {
                return name.text;
            }
            const given = name.given ? name.given.join(' ') : '';
            const family = name.family || '';
            return `${given} ${family}`.trim();
        }
        throw new AppError('Patient name not found in FHIR bundle', 400);
    }

    /**
     * Extract patient ID from Patient resource
     */
    private extractPatientId(patient: Patient): string | undefined {
        if (patient.identifier && patient.identifier.length > 0) {
            // Look for ABDM Health ID or other identifier
            const healthId = patient.identifier.find(
                (id) => id.system?.includes('healthid') || id.system?.includes('abdm')
            );
            return healthId?.value || patient.identifier[0].value;
        }
        return patient.id;
    }

    /**
     * Extract practitioner name from Practitioner resource
     */
    private extractPractitionerName(practitioner: Practitioner): string {
        if (practitioner.name && practitioner.name.length > 0) {
            const name = practitioner.name[0];
            if (name.text) {
                return name.text;
            }
            const given = name.given ? name.given.join(' ') : '';
            const family = name.family || '';
            return `${given} ${family}`.trim();
        }
        throw new AppError('Practitioner name not found in FHIR bundle', 400);
    }

    /**
     * Extract doctor registration number from Practitioner resource
     */
    private extractDoctorRegistration(practitioner: Practitioner): string {
        if (practitioner.identifier && practitioner.identifier.length > 0) {
            // Look for medical council registration
            const registration = practitioner.identifier.find(
                (id) =>
                    id.system?.includes('medical-council') ||
                    id.system?.includes('mci') ||
                    id.system?.includes('doctor')
            );

            if (registration?.value) {
                return registration.value;
            }

            // Fallback to first identifier
            if (practitioner.identifier[0].value) {
                return practitioner.identifier[0].value;
            }
        }

        throw new AppError('Doctor registration number not found in FHIR bundle', 400);
    }

    /**
     * Parse MedicationRequest resource
     */
    private parseMedicationRequest(medicationRequest: MedicationRequest): ParsedMedication {
        // Extract medication name
        let name = 'Unknown Medication';
        if (medicationRequest.medicationCodeableConcept) {
            if (medicationRequest.medicationCodeableConcept.text) {
                name = medicationRequest.medicationCodeableConcept.text;
            } else if (
                medicationRequest.medicationCodeableConcept.coding &&
                medicationRequest.medicationCodeableConcept.coding.length > 0
            ) {
                name = medicationRequest.medicationCodeableConcept.coding[0].display || name;
            }
        }

        // Extract medication code
        const code = medicationRequest.medicationCodeableConcept?.coding?.[0]?.code;

        // Extract dosage instructions
        let dosage: string | undefined;
        let instructions: string | undefined;
        if (
            medicationRequest.dosageInstruction &&
            medicationRequest.dosageInstruction.length > 0
        ) {
            const dosageInst = medicationRequest.dosageInstruction[0];
            instructions = dosageInst.text;

            if (dosageInst.doseAndRate && dosageInst.doseAndRate.length > 0) {
                const dose = dosageInst.doseAndRate[0].doseQuantity;
                if (dose) {
                    dosage = `${dose.value} ${dose.unit || ''}`.trim();
                }
            }
        }

        // Extract quantity
        const quantity = medicationRequest.dispenseRequest?.quantity?.value;

        // Extract duration
        const duration = medicationRequest.dispenseRequest?.expectedSupplyDuration?.value;

        return {
            name,
            code,
            dosage,
            quantity,
            duration,
            instructions,
        };
    }

    /**
     * Validate FHIR bundle structure (basic validation)
     */
    validateBundle(bundle: any): { valid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!bundle) {
            errors.push('Bundle is null or undefined');
            return { valid: false, errors };
        }

        if (bundle.resourceType !== 'Bundle') {
            errors.push('Invalid resourceType: expected Bundle');
        }

        if (!bundle.entry || !Array.isArray(bundle.entry)) {
            errors.push('Missing or invalid entry array');
        }

        if (bundle.entry && bundle.entry.length === 0) {
            errors.push('Bundle has no entries');
        }

        return {
            valid: errors.length === 0,
            errors,
        };
    }
}
