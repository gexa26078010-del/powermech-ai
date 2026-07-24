import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiGatewayProvider } from './ai-provider.interface';
import {
  AiGatewayAuditProviderKey,
  DETERMINISTIC_STUB_PROVIDER_KEY,
  INVALID_CONFIGURATION_PROVIDER_KEY,
  OPENAI_PROVIDER_KEY,
} from './ai-gateway.types';
import { DeterministicStubProvider } from './deterministic-stub.provider';
import { OpenAiProvider } from './openai.provider';

export class AiProviderConfigurationError extends Error {
  constructor(
    readonly providerKey: AiGatewayAuditProviderKey,
    message: string,
  ) {
    super(message);
    this.name = 'AiProviderConfigurationError';
  }
}

@Injectable()
export class AiProviderSelector {
  constructor(
    private readonly configService: ConfigService,
    private readonly deterministicStubProvider: DeterministicStubProvider,
    private readonly openAiProvider: OpenAiProvider,
  ) {}

  select(): AiGatewayProvider {
    const configuredProvider =
      this.configService.get<string>('AI_PROVIDER')?.trim() ||
      DETERMINISTIC_STUB_PROVIDER_KEY;

    if (configuredProvider === DETERMINISTIC_STUB_PROVIDER_KEY) {
      return this.deterministicStubProvider;
    }

    if (configuredProvider === OPENAI_PROVIDER_KEY) {
      const apiKey = this.configService.get<string>('OPENAI_API_KEY')?.trim();
      const model = this.configService.get<string>('OPENAI_MODEL')?.trim();
      if (!apiKey || !model) {
        throw new AiProviderConfigurationError(
          OPENAI_PROVIDER_KEY,
          'OpenAI provider configuration is incomplete.',
        );
      }
      return this.openAiProvider;
    }

    throw new AiProviderConfigurationError(
      INVALID_CONFIGURATION_PROVIDER_KEY,
      'AI provider configuration is unsupported.',
    );
  }
}
