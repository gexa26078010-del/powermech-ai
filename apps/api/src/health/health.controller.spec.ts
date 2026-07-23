import { RequestMethod } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthController', () => {
  it('preserves GET /health route metadata and response behavior', async () => {
    const response = {
      status: 'ok' as const,
      database: 'ok' as const,
      timestamp: '2026-01-01T00:00:00.000Z',
      version: '0.1.0',
      latencyMs: 1,
    };
    const service = {
      check: jest.fn().mockResolvedValue(response),
    } as unknown as HealthService;

    await expect(new HealthController(service).check()).resolves.toEqual(response);
    expect(Reflect.getMetadata(PATH_METADATA, HealthController)).toBe('health');
    expect(Reflect.getMetadata(PATH_METADATA, HealthController.prototype.check)).toBe('/');
    expect(Reflect.getMetadata(METHOD_METADATA, HealthController.prototype.check)).toBe(
      RequestMethod.GET,
    );
  });
});
