import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
} from 'typeorm';

export enum UserRole {
    ADMIN = 'ADMIN',
    PHARMACIST = 'PHARMACIST',
    CASHIER = 'CASHIER',
}

/**
 * User entity for authentication and authorization
 */
@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ unique: true, length: 50 })
    @Index()
    username!: string;

    @Column({ unique: true, length: 100 })
    @Index()
    email!: string;

    @Column({ name: 'password_hash', length: 255 })
    passwordHash!: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.CASHIER,
    })
    role!: UserRole;

    @Column({ name: 'is_active', default: true })
    isActive!: boolean;

    @Column({ name: 'last_login', type: 'timestamp', nullable: true })
    lastLogin?: Date;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;
}
