import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app/app.module';
import { AllExceptionsFilter } from './shared/common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './shared/common/interceptors/logging.interceptor';
import { TransformInterceptor } from './shared/common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Security
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  // Compression
  app.use(compression());

  // CORS
  app.enableCors({
    origin: configService.get('CORS_ORIGINS')?.split(',') || ['http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Global pipes
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

  // Global filters
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // Swagger documentation
  if (configService.get('NODE_ENV') !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Template Backend API')
      .setDescription('API robusta e escalável para o template-backend')
      .setVersion('1.0.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .addTag('Health', 'Endpoints de verificação de saúde')
      .addTag('Authentication', 'Endpoints de autenticação')
      .addTag('OAuth2', 'Endpoints de autenticação OAuth2')
      .addTag('Users', 'Gerenciamento de usuários')
      .addTag('Comunicações', 'Gerenciamento de comunicações')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });

    logger.log('Swagger documentation available at /api/docs');
  }

  // Start server
  const port = configService.get('PORT') || 3000;
  const host = configService.get('HOST') || '0.0.0.0';

  await app.listen(port, host);

  logger.log(`🚀 Application is running on: http://${host}:${port}`);
  logger.log(`📚 Swagger docs available at: http://${host}:${port}/api/docs`);
  logger.log(`🏥 Health check available at: http://${host}:${port}/api/v1/health`);
}

bootstrap().catch((error) => {
  console.error('Error starting application:', error);
  process.exit(1);
});

