import { Module } from '@nestjs/common';
import { DatabaseModule } from '../db/database.module';
import { AiProviderSelector } from './ai-provider.selector';
import { AiGatewayService } from './ai-gateway.service';
import { DeterministicStubProvider } from './deterministic-stub.provider';
import { OpenAiProvider } from './openai.provider';

@Module({
  imports: [DatabaseModule],
  providers: [
    DeterministicStubProvider,
    OpenAiProvider,
    AiProviderSelector,
    AiGatewayService,
  ],
  exports: [AiGatewayService],
})
export class AiGatewayModule {}
