import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@/shared/database/prisma.module';

// Services
import { CommunicationService } from './application/services/communication.service';
import { EmailService } from './application/services/email.service';
import { NotificationService } from './application/services/notification.service';
import { TemplateService } from './application/services/template.service';

// Controllers
import { CommunicationController } from './presentation/controllers/communication.controller';
import { NotificationController } from './presentation/controllers/notification.controller';

// Repositories
import { CommunicationRepository } from './infrastructure/repositories/communication.repository';

// Providers
import { EmailProvider } from './infrastructure/providers/email.provider';
import { SmsProvider } from './infrastructure/providers/sms.provider';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
  ],
  controllers: [
    CommunicationController,
    NotificationController,
  ],
  providers: [
    // Services
    CommunicationService,
    EmailService,
    NotificationService,
    TemplateService,
    
    // Repositories
    CommunicationRepository,
    
    // Providers
    EmailProvider,
    SmsProvider,
  ],
  exports: [
    CommunicationService,
    EmailService,
    NotificationService,
    TemplateService,
  ],
})
export class ComunicacoesModule {}

