import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as request from 'supertest';

// Global test application instance
let app: INestApplication;
let moduleFixture: TestingModule;

// Test database setup
const testDatabaseUrl = 'postgresql://test:test@localhost:5432/test_db';

// Global setup before all tests
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = testDatabaseUrl;
  process.env.JWT_SECRET = 'test-jwt-secret-for-e2e';
  process.env.REDIS_URL = 'redis://localhost:6379/1'; // Use different Redis DB for tests
});

// Global cleanup after all tests
afterAll(async () => {
  if (app) {
    await app.close();
  }
  if (moduleFixture) {
    await moduleFixture.close();
  }
});

// Helper function to create test application
export const createTestApp = async (moduleClass: any): Promise<INestApplication> => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [moduleClass],
  })
    .overrideProvider(ConfigService)
    .useValue({
      get: (key: string, defaultValue?: any) => {
        const config: Record<string, any> = {
          'NODE_ENV': 'test',
          'DATABASE_URL': testDatabaseUrl,
          'JWT_SECRET': 'test-jwt-secret-for-e2e',
          'REDIS_URL': 'redis://localhost:6379/1',
          'app.bcryptRounds': 4,
          'auth.jwt.secret': 'test-jwt-secret-for-e2e',
          'auth.jwt.accessTokenExpiresIn': '1h',
          'auth.jwt.refreshTokenExpiresIn': '30d',
          'app.defaultPageSize': 20,
          'app.maxPageSize': 100,
          'CORS_ORIGINS': 'http://localhost:3000',
        };
        return config[key] ?? defaultValue;
      },
    })
    .compile();

  const app = moduleFixture.createNestApplication();

  // Apply global pipes and filters (same as main.ts)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Set global prefix
  app.setGlobalPrefix('api/v1');

  await app.init();
  return app;
};

// Helper function to authenticate user and get token
export const authenticateUser = async (
  app: INestApplication,
  email: string = 'test@example.com',
  password: string = 'TestPassword123!',
): Promise<string> => {
  // First register the user
  await request(app.getHttpServer())
    .post('/api/v1/auth/register')
    .send({
      email,
      password,
      confirmPassword: password,
      nome: 'Test User',
      acceptTerms: true,
    });

  // Then login to get token
  const loginResponse = await request(app.getHttpServer())
    .post('/api/v1/auth/login')
    .send({
      email,
      password,
    })
    .expect(200);

  return loginResponse.body.accessToken;
};

// Helper function to create authenticated request
export const authenticatedRequest = (
  app: INestApplication,
  token: string,
  method: 'get' | 'post' | 'put' | 'delete' | 'patch' = 'get',
) => {
  return request(app.getHttpServer())
    [method]
    .bind(request(app.getHttpServer()))
    .call(request(app.getHttpServer()))
    .set('Authorization', `Bearer ${token}`);
};

// Test data factories
export const createTestUser = (overrides: Partial<any> = {}) => ({
  email: 'test@example.com',
  password: 'TestPassword123!',
  confirmPassword: 'TestPassword123!',
  nome: 'Test User',
  telefone: '+5511999999999',
  acceptTerms: true,
  ...overrides,
});

export const createTestComunicacao = (overrides: Partial<any> = {}) => ({
  titulo: 'Test Communication',
  tipo: 'comunicado',
  descricao: 'This is a test communication',
  conteudo: 'Detailed content of the test communication',
  tags: ['test', 'communication'],
  prioridade: 'media',
  status: 'publicado',
  ...overrides,
});

// Database cleanup helpers
export const cleanupDatabase = async () => {
  // This would typically clean up test data
  // Implementation depends on your database setup
  console.log('Cleaning up test database...');
};

// Mock external services
export const mockExternalServices = () => {
  // Mock email service
  jest.mock('nodemailer', () => ({
    createTransport: jest.fn(() => ({
      sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
    })),
  }));

  // Mock Redis
  jest.mock('redis', () => ({
    createClient: jest.fn(() => ({
      connect: jest.fn(),
      disconnect: jest.fn(),
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      exists: jest.fn(),
    })),
  }));
};

// Global test utilities
declare global {
  var createTestApp: (moduleClass: any) => Promise<INestApplication>;
  var authenticateUser: (app: INestApplication, email?: string, password?: string) => Promise<string>;
  var authenticatedRequest: (app: INestApplication, token: string, method?: string) => any;
  var createTestUser: (overrides?: Partial<any>) => any;
  var createTestComunicacao: (overrides?: Partial<any>) => any;
  var cleanupDatabase: () => Promise<void>;
  var mockExternalServices: () => void;
}

// Export utilities globally
global.createTestApp = createTestApp;
global.authenticateUser = authenticateUser;
global.authenticatedRequest = authenticatedRequest;
global.createTestUser = createTestUser;
global.createTestComunicacao = createTestComunicacao;
global.cleanupDatabase = cleanupDatabase;
global.mockExternalServices = mockExternalServices;

