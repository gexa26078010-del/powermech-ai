import { ConfigService } from '@nestjs/config';
import {
  AiProviderConfigurationError,
  AiProviderSelector,
} from './ai-provider.selector';
import {
  DETERMINISTIC_STUB_PROVIDER_KEY,
  INVALID_CONFIGURATION_PROVIDER_KEY,
  OPENAI_PROVIDER_KEY,
} from './ai-gateway.types';
import { DeterministicStubProvider } from './deterministic-stub.provider';
import { OpenAiProvider } from './openai.provider';

const createSelector = (configuration: Record<string, string> = {}) => {
  const configService = new ConfigService(configuration);
  const deterministicProvider = new DeterministicStubProvider();
  const openAiProvider = new OpenAiProvider(configService);
  return new AiProviderSelector(
    configService,
    deterministicProvider,
    openAiProvider,
  );
};

describe('AiProviderSelector', () => {
  it('uses deterministic_stub when AI_PROVIDER is absent', () => {
    const provider = createSelector().select();

    expect(provider.providerKey).toBe(DETERMINISTIC_STUB_PROVIDER_KEY);
    expect(provider.realProvider).toBe(false);
  });

  it('uses deterministic_stub explicitly without any provider secret', () => {
    const provider = createSelector({
      AI_PROVIDER: DETERMINISTIC_STUB_PROVIDER_KEY,
    }).select();

    expect(provider.providerKey).toBe(DETERMINISTIC_STUB_PROVIDER_KEY);
  });

  it('selects OpenAI only when model and key are both configured', () => {
    const provider = createSelector({
      AI_PROVIDER: OPENAI_PROVIDER_KEY,
      OPENAI_API_KEY: 'test-api-key',
      OPENAI_MODEL: 'gpt-5-mini',
    }).select();

    expect(provider.providerKey).toBe(OPENAI_PROVIDER_KEY);
    expect(provider.realProvider).toBe(true);
  });

  it('fails closed when OpenAI is selected without a key', () => {
    const selector = createSelector({
      AI_PROVIDER: OPENAI_PROVIDER_KEY,
      OPENAI_MODEL: 'gpt-5-mini',
    });

    expect(() => selector.select()).toThrow(AiProviderConfigurationError);
    try {
      selector.select();
    } catch (error) {
      expect(error).toMatchObject({ providerKey: OPENAI_PROVIDER_KEY });
    }
  });

  it('fails closed for an unsupported provider value', () => {
    const selector = createSelector({ AI_PROVIDER: 'unsupported-provider' });

    expect(() => selector.select()).toThrow(AiProviderConfigurationError);
    try {
      selector.select();
    } catch (error) {
      expect(error).toMatchObject({
        providerKey: INVALID_CONFIGURATION_PROVIDER_KEY,
      });
    }
  });
});
