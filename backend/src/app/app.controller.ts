import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Root endpoint' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns basic application information',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Template Backend API' },
        version: { type: 'string', example: '1.0.0' },
        description: { type: 'string', example: 'API robusta e escalável' },
        timestamp: { type: 'string', format: 'date-time' },
        uptime: { type: 'number', example: 3600.5 },
        environment: { type: 'string', example: 'development' },
        docs: { type: 'string', example: '/api/docs' },
        health: { type: 'string', example: '/api/v1/health' }
      }
    }
  })
  getRoot() {
    return this.appService.getAppInfo();
  }
}

