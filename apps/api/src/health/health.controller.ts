import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { HealthResult, HealthService } from './health.service';
@Controller('health')
export class HealthController { constructor(private readonly healthService: HealthService) {} @Get() async check(): Promise<HealthResult> { const health = await this.healthService.check(); if (health.status !== 'ok') { throw new ServiceUnavailableException(health); } return health; } }
