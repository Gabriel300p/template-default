import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordService {
  private readonly logger = new Logger(PasswordService.name);
  private readonly saltRounds: number;

  constructor(private readonly configService: ConfigService) {
    this.saltRounds = this.configService.get<number>('BCRYPT_ROUNDS', 12);
  }

  async hashPassword(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, this.saltRounds);
    } catch (error) {
      this.logger.error('Error hashing password', error);
      throw error;
    }
  }

  async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      this.logger.error('Error validating password', error);
      return false;
    }
  }

  validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
    score: number;
  } {
    const errors: string[] = [];
    let score = 0;

    const minLength = this.configService.get<number>('PASSWORD_MIN_LENGTH', 8);
    const requireUppercase = this.configService.get<boolean>('PASSWORD_REQUIRE_UPPERCASE', true);
    const requireLowercase = this.configService.get<boolean>('PASSWORD_REQUIRE_LOWERCASE', true);
    const requireNumbers = this.configService.get<boolean>('PASSWORD_REQUIRE_NUMBERS', true);
    const requireSymbols = this.configService.get<boolean>('PASSWORD_REQUIRE_SYMBOLS', true);

    // Check minimum length
    if (password.length < minLength) {
      errors.push(`Password must be at least ${minLength} characters long`);
    } else {
      score += 1;
    }

    // Check for uppercase letters
    if (requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    } else if (/[A-Z]/.test(password)) {
      score += 1;
    }

    // Check for lowercase letters
    if (requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    } else if (/[a-z]/.test(password)) {
      score += 1;
    }

    // Check for numbers
    if (requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    } else if (/\d/.test(password)) {
      score += 1;
    }

    // Check for symbols
    if (requireSymbols && !/[@$!%*?&]/.test(password)) {
      errors.push('Password must contain at least one special character (@$!%*?&)');
    } else if (/[@$!%*?&]/.test(password)) {
      score += 1;
    }

    // Additional scoring for complexity
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
    if (/[^A-Za-z0-9@$!%*?&]/.test(password)) score += 1; // Other special chars

    return {
      isValid: errors.length === 0,
      errors,
      score: Math.min(score, 10), // Cap at 10
    };
  }

  generateRandomPassword(length: number = 16): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '@$!%*?&';
    
    const allChars = lowercase + uppercase + numbers + symbols;
    
    let password = '';
    
    // Ensure at least one character from each required set
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  async isPasswordCompromised(password: string): Promise<boolean> {
    // This is a placeholder for checking against known compromised passwords
    // In a real implementation, you might check against the HaveIBeenPwned API
    // or a local database of compromised passwords
    
    const commonPasswords = [
      'password',
      '123456',
      '123456789',
      'qwerty',
      'abc123',
      'password123',
      'admin',
      'letmein',
      'welcome',
      'monkey',
    ];
    
    return commonPasswords.includes(password.toLowerCase());
  }

  getPasswordStrengthText(score: number): string {
    if (score <= 2) return 'Very Weak';
    if (score <= 4) return 'Weak';
    if (score <= 6) return 'Fair';
    if (score <= 8) return 'Good';
    return 'Strong';
  }

  getPasswordStrengthColor(score: number): string {
    if (score <= 2) return '#ff4757'; // Red
    if (score <= 4) return '#ff6b35'; // Orange
    if (score <= 6) return '#ffa502'; // Yellow
    if (score <= 8) return '#26de81'; // Light Green
    return '#2ed573'; // Green
  }
}

