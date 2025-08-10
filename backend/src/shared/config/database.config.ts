import { registerAs } from '@nestjs/config';

export const databaseConfig = registerAs('database', () => ({
  url: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/template_db',
  
  // Connection pool settings
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 10,
  
  // SSL configuration
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
  } : false,
  
  // Logging
  logging: process.env.DB_LOGGING === 'true',
  
  // Migration settings
  migrationsDir: process.env.DB_MIGRATIONS_DIR || './src/database/migrations',
  seedsDir: process.env.DB_SEEDS_DIR || './src/database/seeds',
  
  // Backup settings
  backupEnabled: process.env.DB_BACKUP_ENABLED === 'true',
  backupSchedule: process.env.DB_BACKUP_SCHEDULE || '0 2 * * *', // Daily at 2 AM
  backupRetentionDays: parseInt(process.env.DB_BACKUP_RETENTION_DAYS, 10) || 30,
  
  // Performance settings
  queryTimeout: parseInt(process.env.DB_QUERY_TIMEOUT, 10) || 30000, // 30 seconds
  statementTimeout: parseInt(process.env.DB_STATEMENT_TIMEOUT, 10) || 60000, // 1 minute
  
  // Development settings
  synchronize: process.env.NODE_ENV === 'development' && process.env.DB_SYNCHRONIZE === 'true',
  dropSchema: process.env.NODE_ENV === 'development' && process.env.DB_DROP_SCHEMA === 'true',
}));

