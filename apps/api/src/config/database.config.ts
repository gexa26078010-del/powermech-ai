import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'powermech_ai_dev',
  user: process.env.DB_USER || 'powermech_dev',
  password: process.env.DB_PASSWORD || 'dev_local_only',
}));
