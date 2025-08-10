import * as bcrypt from 'bcrypt';
import { randomBytes, createHash, createHmac } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class CryptoUtil {
  private readonly logger = new Logger(CryptoUtil.name);
  private readonly saltRounds: number;

  constructor(private configService: ConfigService) {
    this.saltRounds = this.configService.get<number>('app.bcryptRounds', 12);
  }

  /**
   * Hash a password using bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    try {
      const hash = await bcrypt.hash(password, this.saltRounds);
      return hash;
    } catch (error) {
      this.logger.error('Error hashing password', error);
      throw new Error('Erro ao processar senha');
    }
  }

  /**
   * Compare a password with its hash
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    try {
      const isMatch = await bcrypt.compare(password, hash);
      return isMatch;
    } catch (error) {
      this.logger.error('Error comparing password', error);
      return false;
    }
  }

  /**
   * Generate a random token
   */
  generateRandomToken(length: number = 32): string {
    return randomBytes(length).toString('hex');
  }

  /**
   * Generate a secure random string
   */
  generateSecureRandomString(length: number = 16): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const randomArray = randomBytes(length);

    for (let i = 0; i < length; i++) {
      result += chars[randomArray[i] % chars.length];
    }

    return result;
  }

  /**
   * Create SHA256 hash
   */
  createSHA256Hash(data: string): string {
    return createHash('sha256').update(data).digest('hex');
  }

  /**
   * Create HMAC signature
   */
  createHMACSignature(data: string, secret: string): string {
    return createHmac('sha256', secret).update(data).digest('hex');
  }

  /**
   * Verify HMAC signature
   */
  verifyHMACSignature(data: string, signature: string, secret: string): boolean {
    const expectedSignature = this.createHMACSignature(data, secret);
    return this.constantTimeCompare(signature, expectedSignature);
  }

  /**
   * Constant time string comparison to prevent timing attacks
   */
  private constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
  }

  /**
   * Generate a UUID v4
   */
  generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Encrypt data using AES-256-GCM (for future use)
   */
  // async encryptData(data: string, key: string): Promise<{ encrypted: string; iv: string; tag: string }> {
  //   const cipher = createCipher('aes-256-gcm', key);
  //   const iv = randomBytes(16);
  //   cipher.setAAD(Buffer.from('additional-data'));
    
  //   let encrypted = cipher.update(data, 'utf8', 'hex');
  //   encrypted += cipher.final('hex');
    
  //   const tag = cipher.getAuthTag();
    
  //   return {
  //     encrypted,
  //     iv: iv.toString('hex'),
  //     tag: tag.toString('hex')
  //   };
  // }

  /**
   * Generate a password reset token with expiration
   */
  generatePasswordResetToken(): { token: string; expires: Date } {
    const token = this.generateRandomToken(32);
    const expires = new Date();
    expires.setHours(expires.getHours() + 1); // 1 hour expiration

    return { token, expires };
  }

  /**
   * Generate an email verification token
   */
  generateEmailVerificationToken(): { token: string; expires: Date } {
    const token = this.generateRandomToken(32);
    const expires = new Date();
    expires.setHours(expires.getHours() + 24); // 24 hours expiration

    return { token, expires };
  }

  /**
   * Validate password strength
   */
  validatePasswordStrength(password: string): {
    isValid: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    // Length check
    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('Senha deve ter pelo menos 8 caracteres');
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Senha deve conter pelo menos uma letra maiúscula');
    }

    // Lowercase check
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Senha deve conter pelo menos uma letra minúscula');
    }

    // Number check
    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('Senha deve conter pelo menos um número');
    }

    // Special character check
    if (/[@$!%*?&]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Senha deve conter pelo menos um símbolo especial');
    }

    // Additional length bonus
    if (password.length >= 12) {
      score += 1;
    }

    return {
      isValid: score >= 5,
      score,
      feedback,
    };
  }
}

