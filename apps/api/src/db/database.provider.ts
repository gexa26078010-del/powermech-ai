import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, PoolClient } from 'pg';

export const DATABASE_CONNECTION = 'DATABASE_CONNECTION';

export const databaseProvider: Provider = {
  provide: DATABASE_CONNECTION,
  useFactory: async (configService: ConfigService): Promise<Pool> => {
    const databaseConfig = configService.get('database');

    const pool = new Pool({
      host: databaseConfig.host,
      port: databaseConfig.port,
      database: databaseConfig.database,
      user: databaseConfig.user,
      password: databaseConfig.password,
    });

    // Verify connectivity on startup
    try {
      const client: PoolClient = await pool.connect();
      console.log('✓ PostgreSQL connection pool established');
      client.release();
    } catch (error) {
      console.error('✗ PostgreSQL connection failed:', error.message);
      await pool.end();
      throw error;
    }

    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });

    return pool;
  },
  inject: [ConfigService],
};
