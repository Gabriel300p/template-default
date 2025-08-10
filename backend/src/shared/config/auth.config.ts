import { registerAs } from '@nestjs/config';

export const authConfig = registerAs('auth', () => ({
  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-jwt-secret-change-in-production',
    accessTokenExpiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '1h',
    refreshTokenExpiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '30d',
    algorithm: process.env.JWT_ALGORITHM || 'HS256',
    issuer: process.env.JWT_ISSUER || 'template-backend',
    audience: process.env.JWT_AUDIENCE || 'template-frontend',
  },
  
  // Password policy
  password: {
    minLength: parseInt(process.env.PASSWORD_MIN_LENGTH, 10) || 8,
    requireUppercase: process.env.PASSWORD_REQUIRE_UPPERCASE !== 'false',
    requireLowercase: process.env.PASSWORD_REQUIRE_LOWERCASE !== 'false',
    requireNumbers: process.env.PASSWORD_REQUIRE_NUMBERS !== 'false',
    requireSymbols: process.env.PASSWORD_REQUIRE_SYMBOLS !== 'false',
    maxAttempts: parseInt(process.env.PASSWORD_MAX_ATTEMPTS, 10) || 5,
    lockoutDuration: parseInt(process.env.PASSWORD_LOCKOUT_DURATION, 10) || 900000, // 15 minutes
  },
  
  // Session configuration
  session: {
    secret: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
    maxAge: parseInt(process.env.SESSION_MAX_AGE, 10) || 86400000, // 24 hours
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict' as const,
  },
  
  // OAuth2 providers
  oauth: {
    google: {
      enabled: process.env.GOOGLE_OAUTH_ENABLED === 'true',
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/v1/auth/oauth/google/callback',
      scope: ['email', 'profile'],
    },
    github: {
      enabled: process.env.GITHUB_OAUTH_ENABLED === 'true',
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackUrl: process.env.GITHUB_CALLBACK_URL || 'http://localhost:3000/api/v1/auth/oauth/github/callback',
      scope: ['user:email'],
    },
    microsoft: {
      enabled: process.env.MICROSOFT_OAUTH_ENABLED === 'true',
      clientId: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
      callbackUrl: process.env.MICROSOFT_CALLBACK_URL || 'http://localhost:3000/api/v1/auth/oauth/microsoft/callback',
      scope: ['openid', 'profile', 'email'],
      tenant: process.env.MICROSOFT_TENANT || 'common',
    },
  },
  
  // Email verification
  emailVerification: {
    enabled: process.env.EMAIL_VERIFICATION_ENABLED === 'true',
    tokenExpiresIn: process.env.EMAIL_VERIFICATION_TOKEN_EXPIRES_IN || '24h',
    resendCooldown: parseInt(process.env.EMAIL_VERIFICATION_RESEND_COOLDOWN, 10) || 300000, // 5 minutes
  },
  
  // Password reset
  passwordReset: {
    enabled: process.env.PASSWORD_RESET_ENABLED === 'true',
    tokenExpiresIn: process.env.PASSWORD_RESET_TOKEN_EXPIRES_IN || '1h',
    maxAttempts: parseInt(process.env.PASSWORD_RESET_MAX_ATTEMPTS, 10) || 3,
    cooldown: parseInt(process.env.PASSWORD_RESET_COOLDOWN, 10) || 3600000, // 1 hour
  },
  
  // Two-factor authentication
  twoFactor: {
    enabled: process.env.TWO_FACTOR_ENABLED === 'true',
    issuer: process.env.TWO_FACTOR_ISSUER || 'Template Backend',
    window: parseInt(process.env.TWO_FACTOR_WINDOW, 10) || 1,
  },
  
  // Rate limiting for auth endpoints
  rateLimiting: {
    login: {
      windowMs: parseInt(process.env.AUTH_LOGIN_WINDOW_MS, 10) || 900000, // 15 minutes
      max: parseInt(process.env.AUTH_LOGIN_MAX_ATTEMPTS, 10) || 5,
    },
    register: {
      windowMs: parseInt(process.env.AUTH_REGISTER_WINDOW_MS, 10) || 3600000, // 1 hour
      max: parseInt(process.env.AUTH_REGISTER_MAX_ATTEMPTS, 10) || 3,
    },
    passwordReset: {
      windowMs: parseInt(process.env.AUTH_PASSWORD_RESET_WINDOW_MS, 10) || 3600000, // 1 hour
      max: parseInt(process.env.AUTH_PASSWORD_RESET_MAX_ATTEMPTS, 10) || 3,
    },
  },
}));

