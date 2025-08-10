import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  private readonly startTime = Date.now();

  constructor(private readonly configService: ConfigService) {}

  getAppInfo() {
    const uptime = (Date.now() - this.startTime) / 1000;
    
    return {
      name: 'Template Backend API',
      version: '1.0.0',
      description: 'API robusta e escalável para o template-backend',
      timestamp: new Date().toISOString(),
      uptime,
      environment: this.configService.get('NODE_ENV', 'development'),
      docs: '/api/docs',
      health: '/api/v1/health',
    };
  }

  getUptime(): number {
    return (Date.now() - this.startTime) / 1000;
  }
}

