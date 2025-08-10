import { ConfigService } from '@nestjs/config';

// Mock ConfigService for tests
jest.mock('@nestjs/config');

// Global test configuration
beforeAll(async () => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret';
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
  
  // Mock ConfigService
  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: any) => {
      const config: Record<string, any> = {
        'NODE_ENV': 'test',
        'JWT_SECRET': 'test-jwt-secret',
        'DATABASE_URL': 'postgresql://test:test@localhost:5432/test_db',
        'app.bcryptRounds': 4, // Lower rounds for faster tests
        'auth.jwt.secret': 'test-jwt-secret',
        'auth.jwt.accessTokenExpiresIn': '1h',
        'auth.jwt.refreshTokenExpiresIn': '30d',
        'app.defaultPageSize': 20,
        'app.maxPageSize': 100,
      };
      return config[key] ?? defaultValue;
    }),
  };

  (ConfigService as jest.MockedClass<typeof ConfigService>).mockImplementation(
    () => mockConfigService as any,
  );
});

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Global test utilities
global.createMockUser = () => ({
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'test@example.com',
  nome: 'Test User',
  roles: ['user'],
  permissions: ['read:comunicacoes'],
  emailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});

global.createMockRequest = (user?: any) => ({
  user: user || global.createMockUser(),
  requestId: '123e4567-e89b-12d3-a456-426614174000',
  url: '/api/v1/test',
  method: 'GET',
  ip: '127.0.0.1',
  get: jest.fn((header: string) => {
    if (header === 'User-Agent') return 'Jest Test Agent';
    return undefined;
  }),
  query: {},
  params: {},
  body: {},
});

global.createMockResponse = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
  send: jest.fn().mockReturnThis(),
  setHeader: jest.fn().mockReturnThis(),
});

// Extend Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidUUID(): R;
      toBeValidEmail(): R;
      toBeValidDate(): R;
    }
  }

  var createMockUser: () => any;
  var createMockRequest: (user?: any) => any;
  var createMockResponse: () => any;
}

// Custom matchers
expect.extend({
  toBeValidUUID(received: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const pass = uuidRegex.test(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid UUID`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid UUID`,
        pass: false,
      };
    }
  },

  toBeValidEmail(received: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = emailRegex.test(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid email`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid email`,
        pass: false,
      };
    }
  },

  toBeValidDate(received: any) {
    const pass = received instanceof Date && !isNaN(received.getTime());
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid date`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid date`,
        pass: false,
      };
    }
  },
});

