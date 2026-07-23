import { Module } from '@nestjs/common';
import { AiGatewayModule } from '../ai-gateway/ai-gateway.module';
import { DatabaseModule } from '../db/database.module';
import { RepairMentorController } from './repair-mentor.controller';
import { RepairMentorService } from './repair-mentor.service';

@Module({
  imports: [DatabaseModule, AiGatewayModule],
  controllers: [RepairMentorController],
  providers: [RepairMentorService],
})
export class RepairMentorModule {}
