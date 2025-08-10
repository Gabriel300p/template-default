import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  HealthCheckService,
  HealthCheck,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  private readonly startTime = Date.now();

  constructor(
    private readonly health: HealthCheckService,
    private readonly memory: MemoryHealthIndicator,
    private readonly disk: DiskHealthIndicator,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Health Check' })
  @ApiResponse({ 
    status: 200, 
    description: 'Aplicação saudável',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'healthy' },
        timestamp: { type: 'string', format: 'date-time' },
        uptime: { type: 'number', example: 3600.5 },
        version: { type: 'string', example: '1.0.0' }
      }
    }
  })
  @ApiResponse({ 
    status: 503, 
    description: 'Serviço indisponível' 
  })
  check() {
    const uptime = (Date.now() - this.startTime) / 1000;
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime,
      version: '1.0.0',
    };
  }

  @Get('detailed')
  @ApiOperation({ summary: 'Detailed Health Check' })
  @ApiResponse({ 
    status: 200, 
    description: 'Status detalhado dos componentes' 
  })
  @HealthCheck()
  checkDetailed() {
    return this.health.check([
      // Memory check - ensure we're not using more than 300MB
      () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024),
      
      // Disk check - ensure we have at least 1GB free space
      () => this.disk.checkStorage('storage', { 
        path: '/', 
        thresholdPercent: 0.9 
      }),
      
      // Custom application health check
      () => this.checkApplication(),
    ]);
  }

  private async checkApplication() {
    const uptime = (Date.now() - this.startTime) / 1000;
    const environment = this.configService.get('NODE_ENV', 'development');
    
    return {
      application: {
        status: 'up',
        uptime,
        environment,
        version: '1.0.0',
        timestamp: new Date().toISOString(),
      },
    };
  }
}

