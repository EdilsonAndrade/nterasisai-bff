import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  getHealthStatus() {
    return {
      status: 'Interasis Server Online',
      timestamp: new Date().toISOString(),
    };
  }
}
