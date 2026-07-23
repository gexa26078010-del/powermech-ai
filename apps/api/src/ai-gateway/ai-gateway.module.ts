import { Module } from '@nestjs/common';
import { DatabaseModule } from '../db/database.module';
import { AiGatewayService } from './ai-gateway.service';
import { DeterministicStubProvider } from './deterministic-stub.provider';

@Module({
  imports: [DatabaseModule],
  providers: [DeterministicStubProvider, AiGatewayService],
  exports: [AiGatewayService],
})
export class AiGatewayModule {}
