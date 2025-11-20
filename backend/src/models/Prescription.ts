import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
} from 'typeorm';

/**
 * Prescription entity for storing e-prescriptions with FHIR bundles
 */
@Entity('prescriptions')
export class Prescription {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'fhir_bundle', type: 'jsonb' })
    fhirBundle!: any; // FHIR R4 Bundle JSON

    @Column({ name: 'doctor_name', length: 200 })
    @Index()
    doctorName!: string;

    @Column({ name: 'doctor_registration', length: 100 })
    @Index()
    doctorRegistration!: string;

    @Column({ name: 'doctor_verified', default: false })
    doctorVerified!: boolean;

    @Column({ name: 'patient_name', length: 200 })
    @Index()
    patientName!: string;

    @Column({ name: 'patient_id', length: 100, nullable: true })
    patientId?: string;

    @Column({ name: 'prescription_date', type: 'date' })
    @Index()
    prescriptionDate!: Date;

    @Column({ name: 'stored_file_path', length: 500, nullable: true })
    storedFilePath?: string;

    @Column({ type: 'text', nullable: true })
    notes?: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;
}
