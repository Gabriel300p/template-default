import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@/shared/database/prisma.module';

// Services
import { UsersService } from './application/services/users.service';
import { UserProfileService } from './application/services/user-profile.service';
import { UserRoleService } from './application/services/user-role.service';

// Controllers
import { UsersController } from './presentation/controllers/users.controller';
import { UserProfileController } from './presentation/controllers/user-profile.controller';

// Repositories
import { UsersRepository } from './infrastructure/repositories/users.repository';
import { UserRoleRepository } from './infrastructure/repositories/user-role.repository';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
  ],
  controllers: [
    UsersController,
    UserProfileController,
  ],
  providers: [
    // Services
    UsersService,
    UserProfileService,
    UserRoleService,
    
    // Repositories
    UsersRepository,
    UserRoleRepository,
  ],
  exports: [
    UsersService,
    UserProfileService,
    UserRoleService,
    UsersRepository,
  ],
})
export class UsersModule {}

