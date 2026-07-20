import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { DATABASE_CONNECTION } from '../db/database.provider';

export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  checks: {
    database: {
      status: 'up' | 'down';
      latency_ms?: number;
      error?: string;
    };
  };
}

@Injectable()
export class HealthService {
  constructor(
    @Inject(DATABASE_CONNECTION) private pool: Pool,
  ) {}

  async check(): Promise<HealthStatus> {
    const timestamp = new Date().toISOString();
    const startTime = Date.now();

    try {
      const client = await this.pool.connect();
      const latency = Date.now() - startTime;

      try {
        await client.query('SELECT 1');
        client.release();

        return {
          status: 'healthy',
          timestamp,
          checks: {
            database: {
              status: 'up',
              latency_ms: latency,
            },
          },
        };
      } catch (queryError) {
        client.release();
        const latency = Date.now() - startTime;

        return {
          status: 'unhealthy',
          timestamp,
          checks: {
            database: {
              status: 'down',
              latency_ms: latency,
              error: `Query failed: ${queryError.message}`,
            },
          },
        };
      }
    } catch (error) {
      const latency = Date.now() - startTime;

      return {
        status: 'unhealthy',
        timestamp,
        checks: {
          database: {
            status: 'down',
            latency_ms: latency,
            error: `Connection failed: ${error.message}`,
          },
        },
      };
    }
  }
}
