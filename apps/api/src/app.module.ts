import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './config/database.config';
import { HealthModule } from './health/health.module';

@Module({ imports: [ConfigModule.forRoot({ isGlobal: true, load: [databaseConfig] }), HealthModule] })
export class AppModule {}
