import 'reflect-metadata';
import { AppDataSource } from '../config/database';
import { User, UserRole } from '../models/User';
import { Medicine } from '../models/Medicine';
import { Batch } from '../models/Batch';
import { Prescription } from '../models/Prescription';
import { ScheduleType } from '../utils/complianceRules';
import bcrypt from 'bcrypt';
import logger from '../utils/logger';

/**
 * Seed database with initial data
 */
async function seedDatabase() {
    try {
        // Initialize database connection
        await AppDataSource.initialize();
        logger.info('Database connected for seeding');

        // Clear existing data (optional - comment out in production)
        // await AppDataSource.dropDatabase();
        // await AppDataSource.synchronize();

        const userRepository = AppDataSource.getRepository(User);
        const medicineRepository = AppDataSource.getRepository(Medicine);
        const batchRepository = AppDataSource.getRepository(Batch);
        const prescriptionRepository = AppDataSource.getRepository(Prescription);

        // Create users
        logger.info('Creating users...');

        const adminPassword = await bcrypt.hash('admin123', 10);
        const admin = userRepository.create({
            username: 'admin',
            email: 'admin@pharmacy.com',
            passwordHash: adminPassword,
            role: UserRole.ADMIN,
        });
        await userRepository.save(admin);

        const pharmacistPassword = await bcrypt.hash('pharmacist123', 10);
        const pharmacist = userRepository.create({
            username: 'pharmacist',
            email: 'pharmacist@pharmacy.com',
            passwordHash: pharmacistPassword,
            role: UserRole.PHARMACIST,
        });
        await userRepository.save(pharmacist);

        const cashierPassword = await bcrypt.hash('cashier123', 10);
        const cashier = userRepository.create({
            username: 'cashier',
            email: 'cashier@pharmacy.com',
            passwordHash: cashierPassword,
            role: UserRole.CASHIER,
        });
        await userRepository.save(cashier);

        logger.info('✅ Users created');

        // Create medicines
        logger.info('Creating medicines...');

        const medicines = [
            // OTC Medicines
            {
                name: 'Paracetamol 500mg',
                genericName: 'Paracetamol',
                manufacturer: 'Cipla Ltd',
                scheduleType: ScheduleType.OTC,
                hsnCode: '30049011',
                unitPrice: 2.5,
                reorderLevel: 100,
                description: 'Pain reliever and fever reducer',
            },
            {
                name: 'Cetirizine 10mg',
                genericName: 'Cetirizine Hydrochloride',
                manufacturer: 'Sun Pharma',
                scheduleType: ScheduleType.OTC,
                hsnCode: '30049012',
                unitPrice: 1.5,
                reorderLevel: 50,
                description: 'Antihistamine for allergies',
            },
            // Schedule H Medicines
            {
                name: 'Amoxicillin 500mg',
                genericName: 'Amoxicillin',
                manufacturer: 'Dr. Reddy\'s',
                scheduleType: ScheduleType.H,
                hsnCode: '30041011',
                unitPrice: 8.0,
                reorderLevel: 50,
                description: 'Antibiotic for bacterial infections',
            },
            {
                name: 'Metformin 500mg',
                genericName: 'Metformin Hydrochloride',
                manufacturer: 'USV Ltd',
                scheduleType: ScheduleType.H,
                hsnCode: '30043911',
                unitPrice: 3.0,
                reorderLevel: 100,
                description: 'Diabetes medication',
            },
            // Schedule H1 Medicines
            {
                name: 'Azithromycin 500mg',
                genericName: 'Azithromycin',
                manufacturer: 'Cipla Ltd',
                scheduleType: ScheduleType.H1,
                hsnCode: '30041012',
                unitPrice: 15.0,
                reorderLevel: 30,
                description: 'Antibiotic for respiratory infections',
            },
            {
                name: 'Cefixime 200mg',
                genericName: 'Cefixime',
                manufacturer: 'Lupin Ltd',
                scheduleType: ScheduleType.H1,
                hsnCode: '30041013',
                unitPrice: 12.0,
                reorderLevel: 30,
                description: 'Third-generation cephalosporin antibiotic',
            },
            // Schedule X Medicines
            {
                name: 'Alprazolam 0.5mg',
                genericName: 'Alprazolam',
                manufacturer: 'Torrent Pharma',
                scheduleType: ScheduleType.X,
                hsnCode: '30049091',
                unitPrice: 5.0,
                reorderLevel: 20,
                description: 'Benzodiazepine for anxiety',
            },
            {
                name: 'Tramadol 50mg',
                genericName: 'Tramadol Hydrochloride',
                manufacturer: 'Zydus Cadila',
                scheduleType: ScheduleType.X,
                hsnCode: '30049092',
                unitPrice: 6.0,
                reorderLevel: 20,
                description: 'Opioid pain medication',
            },
        ];

        const savedMedicines = [];
        for (const medicineData of medicines) {
            const medicine = medicineRepository.create(medicineData);
            await medicineRepository.save(medicine);
            savedMedicines.push(medicine);
        }

        logger.info('✅ Medicines created');

        // Create batches for medicines
        logger.info('Creating batches...');

        const now = new Date();
        const batches = [];

        for (const medicine of savedMedicines) {
            // Create 2-3 batches per medicine with different expiry dates
            const batchCount = Math.floor(Math.random() * 2) + 2;

            for (let i = 0; i < batchCount; i++) {
                const manufactureDate = new Date(now);
                manufactureDate.setMonth(manufactureDate.getMonth() - Math.floor(Math.random() * 12));

                const expiryDate = new Date(manufactureDate);
                expiryDate.setFullYear(expiryDate.getFullYear() + 2 + Math.floor(Math.random() * 2));

                const quantity = Math.floor(Math.random() * 200) + 50;
                const costPrice = medicine.unitPrice * 0.7;
                const mrp = medicine.unitPrice * 1.2;

                const batch = batchRepository.create({
                    medicineId: medicine.id,
                    batchNumber: `BATCH-${medicine.name.substring(0, 3).toUpperCase()}-${Date.now()}-${i}`,
                    manufactureDate,
                    expiryDate,
                    quantity,
                    mrp,
                    costPrice,
                });

                await batchRepository.save(batch);
                batches.push(batch);
            }
        }

        logger.info('✅ Batches created');

        // Create sample FHIR prescription
        logger.info('Creating sample prescription...');

        const sampleFHIRBundle = {
            resourceType: 'Bundle',
            type: 'document',
            entry: [
                {
                    resource: {
                        resourceType: 'Patient',
                        id: 'patient-1',
                        identifier: [
                            {
                                system: 'https://healthid.ndhm.gov.in',
                                value: '1234-5678-9012',
                            },
                        ],
                        name: [
                            {
                                text: 'Rajesh Kumar',
                                given: ['Rajesh'],
                                family: 'Kumar',
                            },
                        ],
                        gender: 'male',
                        birthDate: '1985-06-15',
                    },
                },
                {
                    resource: {
                        resourceType: 'Practitioner',
                        id: 'doctor-1',
                        identifier: [
                            {
                                system: 'https://nmc.org.in',
                                value: 'MH/12345',
                            },
                        ],
                        name: [
                            {
                                text: 'Dr. Priya Sharma',
                                given: ['Priya'],
                                family: 'Sharma',
                            },
                        ],
                        qualification: [
                            {
                                code: {
                                    coding: [
                                        {
                                            system: 'http://terminology.hl7.org/CodeSystem/v2-0360',
                                            code: 'MD',
                                            display: 'Doctor of Medicine',
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                },
                {
                    resource: {
                        resourceType: 'MedicationRequest',
                        id: 'med-req-1',
                        status: 'active',
                        intent: 'order',
                        medicationCodeableConcept: {
                            coding: [
                                {
                                    system: 'http://snomed.info/sct',
                                    code: '372687004',
                                    display: 'Amoxicillin',
                                },
                            ],
                            text: 'Amoxicillin 500mg',
                        },
                        subject: {
                            reference: 'Patient/patient-1',
                            display: 'Rajesh Kumar',
                        },
                        requester: {
                            reference: 'Practitioner/doctor-1',
                            display: 'Dr. Priya Sharma',
                        },
                        dosageInstruction: [
                            {
                                text: 'Take 1 capsule three times daily after meals',
                                timing: {
                                    repeat: {
                                        frequency: 3,
                                        period: 1,
                                        periodUnit: 'd',
                                    },
                                },
                                doseAndRate: [
                                    {
                                        doseQuantity: {
                                            value: 1,
                                            unit: 'capsule',
                                        },
                                    },
                                ],
                            },
                        ],
                        dispenseRequest: {
                            quantity: {
                                value: 21,
                                unit: 'capsule',
                            },
                            expectedSupplyDuration: {
                                value: 7,
                                unit: 'days',
                            },
                        },
                        authoredOn: new Date().toISOString(),
                    },
                },
            ],
        };

        const prescription = prescriptionRepository.create({
            fhirBundle: sampleFHIRBundle,
            doctorName: 'Dr. Priya Sharma',
            doctorRegistration: 'MH/12345',
            doctorVerified: true,
            patientName: 'Rajesh Kumar',
            patientId: '1234-5678-9012',
            prescriptionDate: new Date(),
        });

        await prescriptionRepository.save(prescription);

        logger.info('✅ Sample prescription created');

        logger.info('🎉 Database seeding completed successfully!');
        logger.info('\n📝 Test Credentials:');
        logger.info('Admin: username=admin, password=admin123');
        logger.info('Pharmacist: username=pharmacist, password=pharmacist123');
        logger.info('Cashier: username=cashier, password=cashier123');

        await AppDataSource.destroy();
        process.exit(0);
    } catch (error) {
        logger.error('Error seeding database:', error);
        process.exit(1);
    }
}

// Run seeding
seedDatabase();
