import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  name: process.env.APP_NAME || 'Template Backend',
  version: process.env.APP_VERSION || '1.0.0',
  description: process.env.APP_DESCRIPTION || 'API robusta e escalável',
  environment: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  host: process.env.HOST || '0.0.0.0',
  
  // CORS configuration
  corsOrigins: process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:5173',
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
  
  // API configuration
  apiPrefix: process.env.API_PREFIX || 'api/v1',
  
  // File upload
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10 * 1024 * 1024, // 10MB
  uploadPath: process.env.UPLOAD_PATH || './uploads',
  
  // Pagination
  defaultPageSize: parseInt(process.env.DEFAULT_PAGE_SIZE, 10) || 20,
  maxPageSize: parseInt(process.env.MAX_PAGE_SIZE, 10) || 100,
  
  // Security
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 12,
  
  // Rate limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60000, // 1 minute
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  
  // Session
  sessionSecret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  
  // External services
  emailService: {
    enabled: process.env.EMAIL_SERVICE_ENABLED === 'true',
    provider: process.env.EMAIL_PROVIDER || 'nodemailer',
    from: process.env.EMAIL_FROM || 'noreply@template.com',
  },
  
  // Monitoring
  enableMetrics: process.env.ENABLE_METRICS === 'true',
  metricsPath: process.env.METRICS_PATH || '/metrics',
  
  // Health checks
  healthCheckTimeout: parseInt(process.env.HEALTH_CHECK_TIMEOUT, 10) || 5000,
}));

