import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../../application/services/auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  private readonly logger = new Logger(LocalStrategy.name);

  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<any> {
    try {
      const user = await this.authService.validateUser(email, password);
      
      if (!user) {
        this.logger.warn(`Failed login attempt for email: ${email}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      this.logger.log(`Successful login for user: ${user.id}`);
      return user;
    } catch (error) {
      this.logger.error('Error in local strategy validation', error);
      throw error;
    }
  }
}

