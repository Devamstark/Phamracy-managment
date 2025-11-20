import Joi from 'joi';
import { ScheduleType } from './complianceRules';

/**
 * Validation schemas for API requests
 */

// User registration/login
export const loginSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(6).required(),
});

export const registerSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('ADMIN', 'PHARMACIST', 'CASHIER').required(),
});

// Medicine
export const medicineSchema = Joi.object({
    name: Joi.string().min(2).max(200).required(),
    genericName: Joi.string().min(2).max(200).required(),
    manufacturer: Joi.string().min(2).max(200).required(),
    scheduleType: Joi.string()
        .valid(...Object.values(ScheduleType))
        .required(),
    hsnCode: Joi.string().pattern(/^\d{4,8}$/).required(),
    unitPrice: Joi.number().positive().required(),
    reorderLevel: Joi.number().integer().min(0).required(),
    description: Joi.string().max(500).optional(),
});

export const updateMedicineSchema = Joi.object({
    name: Joi.string().min(2).max(200).optional(),
    genericName: Joi.string().min(2).max(200).optional(),
    manufacturer: Joi.string().min(2).max(200).optional(),
    scheduleType: Joi.string()
        .valid(...Object.values(ScheduleType))
        .optional(),
    hsnCode: Joi.string().pattern(/^\d{4,8}$/).optional(),
    unitPrice: Joi.number().positive().optional(),
    reorderLevel: Joi.number().integer().min(0).optional(),
    description: Joi.string().max(500).optional(),
});

// Batch
export const batchSchema = Joi.object({
    medicineId: Joi.string().uuid().required(),
    batchNumber: Joi.string().min(1).max(50).required(),
    manufactureDate: Joi.date().max('now').required(),
    expiryDate: Joi.date().greater(Joi.ref('manufactureDate')).required(),
    quantity: Joi.number().integer().positive().required(),
    mrp: Joi.number().positive().required(),
    costPrice: Joi.number().positive().required(),
});

// Prescription
export const prescriptionUploadSchema = Joi.object({
    fhirBundle: Joi.object().required(),
    patientName: Joi.string().min(2).max(200).optional(),
    patientId: Joi.string().max(100).optional(),
});

// Sale
export const saleSchema = Joi.object({
    prescriptionId: Joi.string().uuid().optional().allow(null),
    customerName: Joi.string().min(2).max(200).optional(),
    items: Joi.array()
        .items(
            Joi.object({
                medicineId: Joi.string().uuid().required(),
                batchId: Joi.string().uuid().required(),
                quantity: Joi.number().integer().positive().required(),
            })
        )
        .min(1)
        .required(),
    discount: Joi.number().min(0).max(100).default(0),
    paymentMethod: Joi.string()
        .valid('CASH', 'CARD', 'UPI', 'INSURANCE')
        .default('CASH'),
});

// Query parameters
export const paginationSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string().optional(),
    sortOrder: Joi.string().valid('ASC', 'DESC').default('ASC'),
});

export const dateRangeSchema = Joi.object({
    startDate: Joi.date().optional(),
    endDate: Joi.date().min(Joi.ref('startDate')).optional(),
});

/**
 * Validate request body against schema
 */
export function validate<T>(
    schema: Joi.ObjectSchema,
    data: any
): { value: T; error?: string } {
    const { error, value } = schema.validate(data, {
        abortEarly: false,
        stripUnknown: true,
    });

    if (error) {
        const errorMessage = error.details.map((detail) => detail.message).join(', ');
        return { value: value as T, error: errorMessage };
    }

    return { value: value as T };
}
