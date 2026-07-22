import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
export const DATABASE_CONNECTION = 'DATABASE_CONNECTION';
export const databaseProvider: Provider = { provide: DATABASE_CONNECTION, useFactory: (configService: ConfigService): Pool => { const pool = new Pool({ host: configService.get<string>('database.host') ?? 'localhost', port: configService.get<number>('database.port') ?? 5432, database: configService.get<string>('database.database') ?? 'powermech_ai_dev', user: configService.get<string>('database.user') ?? 'powermech_dev', password: configService.get<string>('database.password') ?? 'dev_local_only', connectionTimeoutMillis: 2000 }); pool.on('error', (error: Error) => { console.error('Unexpected PostgreSQL pool error:', error.message); }); return pool; }, inject: [ConfigService] };
