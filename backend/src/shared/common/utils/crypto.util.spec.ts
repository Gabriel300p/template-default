import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CryptoUtil } from './crypto.util';

describe('CryptoUtil', () => {
  let cryptoUtil: CryptoUtil;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CryptoUtil,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: any) => {
              if (key === 'app.bcryptRounds') return 4; // Lower rounds for faster tests
              return defaultValue;
            }),
          },
        },
      ],
    }).compile();

    cryptoUtil = module.get<CryptoUtil>(CryptoUtil);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('hashPassword', () => {
    it('should hash a password successfully', async () => {
      const password = 'TestPassword123!';
      const hash = await cryptoUtil.hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50);
    });

    it('should generate different hashes for the same password', async () => {
      const password = 'TestPassword123!';
      const hash1 = await cryptoUtil.hashPassword(password);
      const hash2 = await cryptoUtil.hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('comparePassword', () => {
    it('should return true for correct password', async () => {
      const password = 'TestPassword123!';
      const hash = await cryptoUtil.hashPassword(password);
      const isMatch = await cryptoUtil.comparePassword(password, hash);

      expect(isMatch).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const password = 'TestPassword123!';
      const wrongPassword = 'WrongPassword123!';
      const hash = await cryptoUtil.hashPassword(password);
      const isMatch = await cryptoUtil.comparePassword(wrongPassword, hash);

      expect(isMatch).toBe(false);
    });

    it('should return false for invalid hash', async () => {
      const password = 'TestPassword123!';
      const invalidHash = 'invalid-hash';
      const isMatch = await cryptoUtil.comparePassword(password, invalidHash);

      expect(isMatch).toBe(false);
    });
  });

  describe('generateRandomToken', () => {
    it('should generate a random token with default length', () => {
      const token = cryptoUtil.generateRandomToken();

      expect(token).toBeDefined();
      expect(token.length).toBe(64); // 32 bytes = 64 hex characters
      expect(/^[a-f0-9]+$/.test(token)).toBe(true);
    });

    it('should generate a random token with custom length', () => {
      const length = 16;
      const token = cryptoUtil.generateRandomToken(length);

      expect(token).toBeDefined();
      expect(token.length).toBe(32); // 16 bytes = 32 hex characters
      expect(/^[a-f0-9]+$/.test(token)).toBe(true);
    });

    it('should generate different tokens', () => {
      const token1 = cryptoUtil.generateRandomToken();
      const token2 = cryptoUtil.generateRandomToken();

      expect(token1).not.toBe(token2);
    });
  });

  describe('generateSecureRandomString', () => {
    it('should generate a secure random string with default length', () => {
      const randomString = cryptoUtil.generateSecureRandomString();

      expect(randomString).toBeDefined();
      expect(randomString.length).toBe(16);
      expect(/^[A-Za-z0-9]+$/.test(randomString)).toBe(true);
    });

    it('should generate a secure random string with custom length', () => {
      const length = 32;
      const randomString = cryptoUtil.generateSecureRandomString(length);

      expect(randomString).toBeDefined();
      expect(randomString.length).toBe(length);
      expect(/^[A-Za-z0-9]+$/.test(randomString)).toBe(true);
    });
  });

  describe('createSHA256Hash', () => {
    it('should create a SHA256 hash', () => {
      const data = 'test data';
      const hash = cryptoUtil.createSHA256Hash(data);

      expect(hash).toBeDefined();
      expect(hash.length).toBe(64); // SHA256 produces 64 character hex string
      expect(/^[a-f0-9]+$/.test(hash)).toBe(true);
    });

    it('should create consistent hashes for same input', () => {
      const data = 'test data';
      const hash1 = cryptoUtil.createSHA256Hash(data);
      const hash2 = cryptoUtil.createSHA256Hash(data);

      expect(hash1).toBe(hash2);
    });

    it('should create different hashes for different inputs', () => {
      const data1 = 'test data 1';
      const data2 = 'test data 2';
      const hash1 = cryptoUtil.createSHA256Hash(data1);
      const hash2 = cryptoUtil.createSHA256Hash(data2);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('createHMACSignature', () => {
    it('should create an HMAC signature', () => {
      const data = 'test data';
      const secret = 'test secret';
      const signature = cryptoUtil.createHMACSignature(data, secret);

      expect(signature).toBeDefined();
      expect(signature.length).toBe(64); // HMAC-SHA256 produces 64 character hex string
      expect(/^[a-f0-9]+$/.test(signature)).toBe(true);
    });

    it('should create consistent signatures for same input and secret', () => {
      const data = 'test data';
      const secret = 'test secret';
      const signature1 = cryptoUtil.createHMACSignature(data, secret);
      const signature2 = cryptoUtil.createHMACSignature(data, secret);

      expect(signature1).toBe(signature2);
    });
  });

  describe('verifyHMACSignature', () => {
    it('should verify correct HMAC signature', () => {
      const data = 'test data';
      const secret = 'test secret';
      const signature = cryptoUtil.createHMACSignature(data, secret);
      const isValid = cryptoUtil.verifyHMACSignature(data, signature, secret);

      expect(isValid).toBe(true);
    });

    it('should reject incorrect HMAC signature', () => {
      const data = 'test data';
      const secret = 'test secret';
      const wrongSignature = 'wrong-signature';
      const isValid = cryptoUtil.verifyHMACSignature(data, wrongSignature, secret);

      expect(isValid).toBe(false);
    });
  });

  describe('generateUUID', () => {
    it('should generate a valid UUID v4', () => {
      const uuid = cryptoUtil.generateUUID();

      expect(uuid).toBeDefined();
      expect(uuid).toBeValidUUID();
    });

    it('should generate different UUIDs', () => {
      const uuid1 = cryptoUtil.generateUUID();
      const uuid2 = cryptoUtil.generateUUID();

      expect(uuid1).not.toBe(uuid2);
    });
  });

  describe('generatePasswordResetToken', () => {
    it('should generate a password reset token with expiration', () => {
      const { token, expires } = cryptoUtil.generatePasswordResetToken();

      expect(token).toBeDefined();
      expect(token.length).toBe(64); // 32 bytes = 64 hex characters
      expect(expires).toBeValidDate();
      expect(expires.getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe('generateEmailVerificationToken', () => {
    it('should generate an email verification token with expiration', () => {
      const { token, expires } = cryptoUtil.generateEmailVerificationToken();

      expect(token).toBeDefined();
      expect(token.length).toBe(64); // 32 bytes = 64 hex characters
      expect(expires).toBeValidDate();
      expect(expires.getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe('validatePasswordStrength', () => {
    it('should validate a strong password', () => {
      const password = 'StrongPassword123!';
      const result = cryptoUtil.validatePasswordStrength(password);

      expect(result.isValid).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(5);
      expect(result.feedback).toHaveLength(0);
    });

    it('should reject a weak password', () => {
      const password = 'weak';
      const result = cryptoUtil.validatePasswordStrength(password);

      expect(result.isValid).toBe(false);
      expect(result.score).toBeLessThan(5);
      expect(result.feedback.length).toBeGreaterThan(0);
    });

    it('should provide feedback for missing requirements', () => {
      const password = 'password'; // Missing uppercase, numbers, symbols
      const result = cryptoUtil.validatePasswordStrength(password);

      expect(result.isValid).toBe(false);
      expect(result.feedback).toContain('Senha deve conter pelo menos uma letra maiúscula');
      expect(result.feedback).toContain('Senha deve conter pelo menos um número');
      expect(result.feedback).toContain('Senha deve conter pelo menos um símbolo especial');
    });
  });
});

