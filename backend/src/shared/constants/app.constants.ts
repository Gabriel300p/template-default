// Application constants
export const APP_CONSTANTS = {
  // Application info
  NAME: 'Template Backend',
  VERSION: '1.0.0',
  DESCRIPTION: 'API robusta e escalável para o template-backend',
  
  // API configuration
  API_PREFIX: 'api/v1',
  DOCS_PATH: 'api/docs',
  
  // Pagination defaults
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 1,
  
  // File upload limits
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ],
  
  // Cache TTL values (in milliseconds)
  CACHE_TTL: {
    SHORT: 5 * 60 * 1000, // 5 minutes
    MEDIUM: 30 * 60 * 1000, // 30 minutes
    LONG: 60 * 60 * 1000, // 1 hour
    VERY_LONG: 24 * 60 * 60 * 1000, // 24 hours
  },
  
  // Rate limiting
  RATE_LIMIT: {
    WINDOW_MS: 60 * 1000, // 1 minute
    MAX_REQUESTS: 100,
    AUTH_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    AUTH_MAX_REQUESTS: 5,
  },
  
  // Token expiration times
  TOKEN_EXPIRATION: {
    ACCESS_TOKEN: '1h',
    REFRESH_TOKEN: '30d',
    EMAIL_VERIFICATION: '24h',
    PASSWORD_RESET: '1h',
  },
  
  // Password policy
  PASSWORD_POLICY: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SYMBOLS: true,
    MAX_ATTEMPTS: 5,
    LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  },
  
  // Validation patterns
  PATTERNS: {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^\+?[1-9]\d{1,14}$/,
    CPF: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
    CNPJ: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
    UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  },
  
  // HTTP status codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
  },
  
  // Error messages
  ERROR_MESSAGES: {
    VALIDATION_FAILED: 'Dados de entrada inválidos',
    UNAUTHORIZED: 'Token de acesso inválido ou expirado',
    FORBIDDEN: 'Você não possui permissão para acessar este recurso',
    NOT_FOUND: 'Recurso não encontrado',
    CONFLICT: 'Recurso já existe',
    INTERNAL_ERROR: 'Erro interno do servidor',
    RATE_LIMIT_EXCEEDED: 'Muitas tentativas. Tente novamente mais tarde',
    FILE_TOO_LARGE: 'Arquivo muito grande',
    INVALID_FILE_TYPE: 'Tipo de arquivo não permitido',
  },
  
  // Success messages
  SUCCESS_MESSAGES: {
    CREATED: 'Recurso criado com sucesso',
    UPDATED: 'Recurso atualizado com sucesso',
    DELETED: 'Recurso excluído com sucesso',
    LOGIN_SUCCESS: 'Login realizado com sucesso',
    LOGOUT_SUCCESS: 'Logout realizado com sucesso',
    PASSWORD_CHANGED: 'Senha alterada com sucesso',
    EMAIL_SENT: 'Email enviado com sucesso',
  },
  
  // Database constants
  DATABASE: {
    MAX_CONNECTIONS: 10,
    CONNECTION_TIMEOUT: 30000, // 30 seconds
    QUERY_TIMEOUT: 60000, // 1 minute
  },
  
  // Logging levels
  LOG_LEVELS: {
    ERROR: 'error',
    WARN: 'warn',
    INFO: 'info',
    DEBUG: 'debug',
    VERBOSE: 'verbose',
  },
  
  // Environment types
  ENVIRONMENTS: {
    DEVELOPMENT: 'development',
    STAGING: 'staging',
    PRODUCTION: 'production',
    TEST: 'test',
  },
  
  // Queue names (for future use)
  QUEUES: {
    EMAIL: 'email-queue',
    NOTIFICATIONS: 'notifications-queue',
    FILE_PROCESSING: 'file-processing-queue',
    AUDIT_LOGS: 'audit-logs-queue',
  },
  
  // Event names
  EVENTS: {
    USER_CREATED: 'user.created',
    USER_UPDATED: 'user.updated',
    USER_DELETED: 'user.deleted',
    USER_LOGIN: 'user.login',
    USER_LOGOUT: 'user.logout',
    PASSWORD_CHANGED: 'user.password.changed',
    EMAIL_VERIFIED: 'user.email.verified',
    COMUNICACAO_CREATED: 'comunicacao.created',
    COMUNICACAO_UPDATED: 'comunicacao.updated',
    COMUNICACAO_DELETED: 'comunicacao.deleted',
    COMUNICACAO_PUBLISHED: 'comunicacao.published',
  },
  
  // Notification types
  NOTIFICATION_TYPES: {
    EMAIL: 'email',
    SMS: 'sms',
    PUSH: 'push',
    IN_APP: 'in_app',
  },
  
  // Audit actions
  AUDIT_ACTIONS: {
    CREATE: 'CREATE',
    READ: 'READ',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE',
    LOGIN: 'LOGIN',
    LOGOUT: 'LOGOUT',
    PASSWORD_CHANGE: 'PASSWORD_CHANGE',
    EMAIL_VERIFICATION: 'EMAIL_VERIFICATION',
    PASSWORD_RESET: 'PASSWORD_RESET',
  },
} as const;

// Type exports for better TypeScript support
export type AppConstantsType = typeof APP_CONSTANTS;
export type HttpStatusType = typeof APP_CONSTANTS.HTTP_STATUS;
export type ErrorMessagesType = typeof APP_CONSTANTS.ERROR_MESSAGES;
export type SuccessMessagesType = typeof APP_CONSTANTS.SUCCESS_MESSAGES;
export type EventsType = typeof APP_CONSTANTS.EVENTS;
export type AuditActionsType = typeof APP_CONSTANTS.AUDIT_ACTIONS;

