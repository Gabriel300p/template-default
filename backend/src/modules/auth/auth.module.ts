import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '@/shared/database/prisma.module';

// Services
import { AuthService } from './application/services/auth.service';
import { TokenService } from './application/services/token.service';
import { PasswordService } from './application/services/password.service';
import { OAuthService } from './application/services/oauth.service';

// Controllers
import { AuthController } from './presentation/controllers/auth.controller';
import { OAuthController } from './presentation/controllers/oauth.controller';

// Strategies
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { LocalStrategy } from './infrastructure/strategies/local.strategy';
import { GoogleStrategy } from './infrastructure/strategies/google.strategy';
import { GitHubStrategy } from './infrastructure/strategies/github.strategy';

// Guards
import { JwtAuthGuard } from './presentation/guards/jwt-auth.guard';
import { LocalAuthGuard } from './presentation/guards/local-auth.guard';
import { GoogleAuthGuard } from './presentation/guards/google-auth.guard';
import { GitHubAuthGuard } from './presentation/guards/github-auth.guard';

// Repositories
import { AuthRepository } from './infrastructure/repositories/auth.repository';
import { SessionRepository } from './infrastructure/repositories/session.repository';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_ACCESS_TOKEN_EXPIRES_IN', '1h'),
          issuer: configService.get<string>('JWT_ISSUER', 'template-backend'),
          audience: configService.get<string>('JWT_AUDIENCE', 'template-frontend'),
          algorithm: configService.get<any>('JWT_ALGORITHM', 'HS256'),
        },
      }),
      inject: [ConfigService],
    }),
    PrismaModule,
  ],
  controllers: [AuthController, OAuthController],
  providers: [
    // Services
    AuthService,
    TokenService,
    PasswordService,
    OAuthService,
    
    // Strategies
    JwtStrategy,
    LocalStrategy,
    GoogleStrategy,
    GitHubStrategy,
    
    // Guards
    JwtAuthGuard,
    LocalAuthGuard,
    GoogleAuthGuard,
    GitHubAuthGuard,
    
    // Repositories
    AuthRepository,
    SessionRepository,
  ],
  exports: [
    AuthService,
    TokenService,
    PasswordService,
    JwtAuthGuard,
    LocalAuthGuard,
  ],
})
export class AuthModule {}

