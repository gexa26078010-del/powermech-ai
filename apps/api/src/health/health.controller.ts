import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { HealthService, HealthStatus } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private healthService: HealthService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async check(): Promise<HealthStatus> {
    const health = await this.healthService.check();

    // If database is unhealthy, return 503 Service Unavailable
    if (health.status === 'unhealthy') {
      throw {
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        message: 'Service unavailable - database connection failed',
        health,
      };
    }

    return health;
  }
}
