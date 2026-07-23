import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiGatewayModule } from './ai-gateway/ai-gateway.module';
import databaseConfig from './config/database.config';
import { DemoModule } from './demo/demo.module';
import { HealthModule } from './health/health.module';
import { RepairMentorModule } from './repair-mentor/repair-mentor.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [databaseConfig] }),
    HealthModule,
    DemoModule,
    AiGatewayModule,
    RepairMentorModule,
  ],
})
export class AppModule {}
