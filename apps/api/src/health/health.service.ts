import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { DATABASE_CONNECTION } from '../db/database.provider';
export interface HealthResult { status: 'ok' | 'unhealthy'; database: 'ok' | 'error'; timestamp: string; version: string; latencyMs?: number; error?: string; }
const getErrorMessage = (error: unknown): string => error instanceof Error ? error.message : String(error);
@Injectable()
export class HealthService { constructor(@Inject(DATABASE_CONNECTION) private readonly pool: Pool) {} async check(): Promise<HealthResult> { const timestamp = new Date().toISOString(); const startedAt = Date.now(); try { const client = await this.pool.connect(); try { await client.query('SELECT 1'); return { status: 'ok', database: 'ok', timestamp, version: '0.1.0', latencyMs: Date.now() - startedAt }; } finally { client.release(); } } catch (error: unknown) { return { status: 'unhealthy', database: 'error', timestamp, version: '0.1.0', latencyMs: Date.now() - startedAt, error: getErrorMessage(error) }; } } }
