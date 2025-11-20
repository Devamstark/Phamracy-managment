import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

// Import entities
import { User } from '../models/User';
import { Medicine } from '../models/Medicine';
import { Batch } from '../models/Batch';
import { Prescription } from '../models/Prescription';
import { Sale } from '../models/Sale';
import { SaleItem } from '../models/SaleItem';
import { AuditLog } from '../models/AuditLog';

/**
 * TypeORM Data Source configuration
 */
export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'pharmacy_user',
    password: process.env.DB_PASSWORD || 'pharmacy_password',
    database: process.env.DB_DATABASE || 'pharmacy_erx',
    synchronize: process.env.DB_SYNCHRONIZE === 'true', // Only true in development
    logging: process.env.DB_LOGGING === 'true',
    entities: [User, Medicine, Batch, Prescription, Sale, SaleItem, AuditLog],
    migrations: [path.join(__dirname, '../migrations/*.ts')],
    subscribers: [],
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    // Connection pool settings
    extra: {
        max: 20,
        min: 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    },
});

/**
 * Initialize database connection
 */
export async function initializeDatabase(): Promise<void> {
    try {
        await AppDataSource.initialize();
        console.log('✅ Database connection established successfully');

        // Run migrations in production
        if (process.env.NODE_ENV === 'production') {
            await AppDataSource.runMigrations();
            console.log('✅ Database migrations completed');
        }
    } catch (error) {
        console.error('❌ Error during database initialization:', error);
        throw error;
    }
}

/**
 * Close database connection
 */
export async function closeDatabase(): Promise<void> {
    try {
        await AppDataSource.destroy();
        console.log('✅ Database connection closed');
    } catch (error) {
        console.error('❌ Error closing database connection:', error);
        throw error;
    }
}
