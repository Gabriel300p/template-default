import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { TerminusModule } from '@nestjs/terminus';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { redisStore } from 'cache-manager-redis-store';

// Configuration
import { appConfig } from '@/shared/config/app.config';
import { databaseConfig } from '@/shared/config/database.config';
import { authConfig } from '@/shared/config/auth.config';
import { redisConfig } from '@/shared/config/redis.config';

// Modules
import { PrismaModule } from '@/shared/database/prisma.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { UsersModule } from '@/modules/users/users.module';
import { ComunicacoesModule } from '@/modules/comunicacoes/comunicacoes.module';
import { HealthModule } from '@/modules/health/health.module';

// Controllers and Services
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, authConfig, redisConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // Logging
    WinstonModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        level: configService.get('LOG_LEVEL', 'info'),
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.errors({ stack: true }),
          winston.format.json(),
        ),
        transports: [
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.colorize(),
              winston.format.simple(),
            ),
          }),
          new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
          }),
          new winston.transports.File({
            filename: 'logs/combined.log',
          }),
        ],
      }),
      inject: [ConfigService],
    }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      useFactory: (configService: ConfigService) => [
        {
          name: 'short',
          ttl: 1000, // 1 second
          limit: 10,
        },
        {
          name: 'medium',
          ttl: 60000, // 1 minute
          limit: 100,
        },
        {
          name: 'long',
          ttl: 3600000, // 1 hour
          limit: 1000,
        },
      ],
      inject: [ConfigService],
    }),

    // Caching
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async (configService: ConfigService) => {
        const redisUrl = configService.get('REDIS_URL');
        
        if (redisUrl) {
          return {
            store: redisStore as any,
            url: redisUrl,
            ttl: 300, // 5 minutes default
          };
        }

        // Fallback to in-memory cache
        return {
          ttl: 300,
          max: 100,
        };
      },
      inject: [ConfigService],
    }),

    // Event system
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),

    // Scheduling
    ScheduleModule.forRoot(),

    // Health checks
    TerminusModule,

    // Database
    PrismaModule,

    // Feature modules
    AuthModule,
    UsersModule,
    ComunicacoesModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

