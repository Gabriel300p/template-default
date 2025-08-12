import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';

export interface JwtPayload {
  sub: string;
  email: string;
  username?: string;
  roles: string[];
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateTokens(payload: Omit<JwtPayload, 'iat' | 'exp'>): Promise<TokenPair> {
    try {
      const accessToken = await this.generateAccessToken(payload);
      const refreshToken = await this.generateRefreshToken(payload);

      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      this.logger.error('Error generating tokens', error);
      throw error;
    }
  }

  async generateAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): Promise<string> {
    try {
      return this.jwtService.sign(payload, {
        expiresIn: this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRES_IN', '1h'),
        issuer: this.configService.get<string>('JWT_ISSUER', 'template-backend'),
        audience: this.configService.get<string>('JWT_AUDIENCE', 'template-frontend'),
      });
    } catch (error) {
      this.logger.error('Error generating access token', error);
      throw error;
    }
  }

  async generateRefreshToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): Promise<string> {
    try {
      return this.jwtService.sign(payload, {
        expiresIn: this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRES_IN', '30d'),
        issuer: this.configService.get<string>('JWT_ISSUER', 'template-backend'),
        audience: this.configService.get<string>('JWT_AUDIENCE', 'template-frontend'),
      });
    } catch (error) {
      this.logger.error('Error generating refresh token', error);
      throw error;
    }
  }

  async verifyToken(token: string): Promise<JwtPayload> {
    try {
      return this.jwtService.verify(token, {
        issuer: this.configService.get<string>('JWT_ISSUER', 'template-backend'),
        audience: this.configService.get<string>('JWT_AUDIENCE', 'template-frontend'),
      });
    } catch (error) {
      this.logger.error('Error verifying token', error);
      throw error;
    }
  }

  async decodeToken(token: string): Promise<JwtPayload | null> {
    try {
      return this.jwtService.decode(token) as JwtPayload;
    } catch (error) {
      this.logger.error('Error decoding token', error);
      return null;
    }
  }

  generateRandomToken(length: number = 32): string {
    return randomBytes(length).toString('hex');
  }

  generatePasswordResetToken(): string {
    return this.generateRandomToken(32);
  }

  generateEmailVerificationToken(): string {
    return this.generateRandomToken(32);
  }

  getTokenExpirationTime(token: string): Date | null {
    try {
      const decoded = this.decodeToken(token);
      if (decoded && decoded.exp) {
        return new Date(decoded.exp * 1000);
      }
      return null;
    } catch (error) {
      this.logger.error('Error getting token expiration time', error);
      return null;
    }
  }

  isTokenExpired(token: string): boolean {
    try {
      const expirationTime = this.getTokenExpirationTime(token);
      if (!expirationTime) {
        return true;
      }
      return expirationTime < new Date();
    } catch (error) {
      this.logger.error('Error checking token expiration', error);
      return true;
    }
  }

  extractTokenFromHeader(authHeader: string): string | null {
    if (!authHeader) {
      return null;
    }

    const [type, token] = authHeader.split(' ');
    
    if (type !== 'Bearer' || !token) {
      return null;
    }

    return token;
  }
}

