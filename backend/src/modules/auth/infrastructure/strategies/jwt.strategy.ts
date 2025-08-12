import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '@/shared/database/prisma.service';
import { JwtPayload } from '../../application/services/token.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
      issuer: configService.get<string>('JWT_ISSUER', 'template-backend'),
      audience: configService.get<string>('JWT_AUDIENCE', 'template-frontend'),
    });
  }

  async validate(payload: JwtPayload): Promise<any> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: {
          roles: {
            include: {
              role: {
                include: {
                  permissions: {
                    include: {
                      permission: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!user) {
        this.logger.warn(`User not found for JWT payload: ${payload.sub}`);
        throw new UnauthorizedException('User not found');
      }

      if (!user.isActive) {
        this.logger.warn(`Inactive user attempted access: ${user.id}`);
        throw new UnauthorizedException('Account is deactivated');
      }

      if (user.isSuspended) {
        this.logger.warn(`Suspended user attempted access: ${user.id}`);
        throw new UnauthorizedException('Account is suspended');
      }

      // Transform user data for request context
      const { password: _, ...userWithoutPassword } = user;
      
      return {
        ...userWithoutPassword,
        roles: user.roles.map(ur => ur.role.name),
        permissions: user.roles.flatMap(ur => 
          ur.role.permissions.map(rp => rp.permission.name)
        ),
      };
    } catch (error) {
      this.logger.error('Error validating JWT payload', error);
      throw new UnauthorizedException('Invalid token');
    }
  }
}

