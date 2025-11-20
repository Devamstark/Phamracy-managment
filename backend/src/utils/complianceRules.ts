/**
 * Indian Pharmacy Compliance Rules
 * Based on Drugs and Cosmetics Act, 1940 and Rules, 1945
 */

export enum ScheduleType {
    OTC = 'OTC',           // Over-the-counter
    H = 'H',               // Schedule H - Prescription required
    H1 = 'H1',             // Schedule H1 - Stricter prescription requirements
    X = 'X',               // Schedule X - Narcotic and psychotropic substances
}

export interface ComplianceRule {
    scheduleType: ScheduleType;
    requiresPrescription: boolean;
    prescriptionRetentionYears: number;
    requiresDoctorVerification: boolean;
    maxQuantityPerDispense?: number;
    specialLogging: boolean;
    description: string;
}

/**
 * Compliance rules for different medicine schedules
 */
export const COMPLIANCE_RULES: Record<ScheduleType, ComplianceRule> = {
    [ScheduleType.OTC]: {
        scheduleType: ScheduleType.OTC,
        requiresPrescription: false,
        prescriptionRetentionYears: 0,
        requiresDoctorVerification: false,
        specialLogging: false,
        description: 'Over-the-counter medicines that can be sold without prescription',
    },
    [ScheduleType.H]: {
        scheduleType: ScheduleType.H,
        requiresPrescription: true,
        prescriptionRetentionYears: 1,
        requiresDoctorVerification: true,
        specialLogging: true,
        description: 'Schedule H medicines require valid prescription from registered medical practitioner',
    },
    [ScheduleType.H1]: {
        scheduleType: ScheduleType.H1,
        requiresPrescription: true,
        prescriptionRetentionYears: 2,
        requiresDoctorVerification: true,
        specialLogging: true,
        description: 'Schedule H1 medicines require prescription with additional warnings and stricter controls',
    },
    [ScheduleType.X]: {
        scheduleType: ScheduleType.X,
        requiresPrescription: true,
        prescriptionRetentionYears: 2,
        requiresDoctorVerification: true,
        maxQuantityPerDispense: 30, // 30 days supply
        specialLogging: true,
        description: 'Schedule X - Narcotic and psychotropic substances with strict quantity limits',
    },
};

/**
 * Doctor registration number patterns for Indian medical councils
 */
export const DOCTOR_REGISTRATION_PATTERNS = {
    MCI: /^[A-Z]{2}\/\d{4,6}$/,                    // Medical Council of India format
    STATE: /^[A-Z]{2}-[A-Z]{3}-\d{4,6}$/,          // State Medical Council format
    AYUSH: /^AYUSH-[A-Z]{2}-\d{4,6}$/,             // AYUSH practitioners
    DENTAL: /^[A-Z]{2}-DC-\d{4,6}$/,               // Dental Council
};

/**
 * Validate doctor registration number format
 */
export function validateDoctorRegistration(registrationNumber: string): {
    valid: boolean;
    councilType?: string;
    error?: string;
} {
    if (!registrationNumber || registrationNumber.trim() === '') {
        return { valid: false, error: 'Registration number is required' };
    }

    const trimmed = registrationNumber.trim().toUpperCase();

    // Check against known patterns
    if (DOCTOR_REGISTRATION_PATTERNS.MCI.test(trimmed)) {
        return { valid: true, councilType: 'Medical Council of India' };
    }
    if (DOCTOR_REGISTRATION_PATTERNS.STATE.test(trimmed)) {
        return { valid: true, councilType: 'State Medical Council' };
    }
    if (DOCTOR_REGISTRATION_PATTERNS.AYUSH.test(trimmed)) {
        return { valid: true, councilType: 'AYUSH Council' };
    }
    if (DOCTOR_REGISTRATION_PATTERNS.DENTAL.test(trimmed)) {
        return { valid: true, councilType: 'Dental Council' };
    }

    return {
        valid: false,
        error: 'Invalid registration number format. Expected formats: MCI (XX/12345), State (XX-XXX-12345), AYUSH (AYUSH-XX-12345), Dental (XX-DC-12345)',
    };
}

/**
 * GST rates for medicines (as per Indian GST schedule)
 */
export const GST_RATES = {
    MEDICINES_GENERAL: 12,        // Most medicines
    MEDICINES_LIFESAVING: 5,      // Life-saving medicines (specified list)
    MEDICINES_EXEMPT: 0,          // Exempt medicines (very few)
    MEDICAL_DEVICES: 12,          // Medical devices
};

/**
 * Get GST rate based on HSN code
 * Note: This is a simplified version. In production, maintain a comprehensive HSN-to-GST mapping
 */
export function getGSTRate(hsnCode: string): number {
    // HSN codes starting with 3003 or 3004 are typically medicines
    if (hsnCode.startsWith('3003') || hsnCode.startsWith('3004')) {
        return GST_RATES.MEDICINES_GENERAL;
    }
    // Default to 12% for medical products
    return GST_RATES.MEDICINES_GENERAL;
}

/**
 * Check if a medicine can be dispensed based on compliance rules
 */
export function canDispenseMedicine(
    scheduleType: ScheduleType,
    hasPrescription: boolean,
    isDoctorVerified: boolean,
    quantity: number
): {
    allowed: boolean;
    warnings: string[];
    errors: string[];
} {
    const rule = COMPLIANCE_RULES[scheduleType];
    const warnings: string[] = [];
    const errors: string[] = [];

    // Check prescription requirement
    if (rule.requiresPrescription && !hasPrescription) {
        errors.push(`${scheduleType} medicines require a valid prescription`);
    }

    // Check doctor verification
    if (rule.requiresDoctorVerification && !isDoctorVerified) {
        errors.push('Doctor verification is required for this medicine');
    }

    // Check quantity limits
    if (rule.maxQuantityPerDispense && quantity > rule.maxQuantityPerDispense) {
        errors.push(
            `Maximum quantity per dispense is ${rule.maxQuantityPerDispense} units for ${scheduleType} medicines`
        );
    }

    // Add warnings for special schedules
    if (scheduleType === ScheduleType.X) {
        warnings.push('Schedule X medicine - Ensure proper documentation and retention');
    }
    if (scheduleType === ScheduleType.H1) {
        warnings.push('Schedule H1 medicine - Additional warnings must be provided to patient');
    }

    return {
        allowed: errors.length === 0,
        warnings,
        errors,
    };
}

/**
 * Prescription validity period (in days)
 */
export const PRESCRIPTION_VALIDITY_DAYS = {
    [ScheduleType.OTC]: 0,      // Not applicable
    [ScheduleType.H]: 30,       // 30 days
    [ScheduleType.H1]: 30,      // 30 days
    [ScheduleType.X]: 7,        // 7 days for narcotics
};

/**
 * Check if prescription is still valid
 */
export function isPrescriptionValid(
    prescriptionDate: Date,
    scheduleType: ScheduleType
): boolean {
    if (scheduleType === ScheduleType.OTC) {
        return true; // No prescription needed
    }

    const validityDays = PRESCRIPTION_VALIDITY_DAYS[scheduleType];
    const expiryDate = new Date(prescriptionDate);
    expiryDate.setDate(expiryDate.getDate() + validityDays);

    return new Date() <= expiryDate;
}
