import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiGatewayProvider } from './ai-provider.interface';
import {
  OPENAI_PROVIDER_KEY,
  RepairMentorGatewayRequest,
} from './ai-gateway.types';

const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';
const REQUEST_TIMEOUT_MS = 15000;

const CONTROLLED_REPAIR_MENTOR_SCHEMA = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    nextChecks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          checkKey: { type: 'string' },
          title: { type: 'string' },
          reason: { type: 'string' },
          priority: { type: 'integer' },
        },
        required: ['checkKey', 'title', 'reason', 'priority'],
        additionalProperties: false,
      },
    },
    safetyWarnings: {
      type: 'array',
      items: { type: 'string' },
    },
    limitations: {
      type: 'array',
      items: { type: 'string' },
    },
    humanVerificationRequired: { type: 'boolean', enum: [true] },
    finalDiagnosisProvided: { type: 'boolean', enum: [false] },
    repairApprovalProvided: { type: 'boolean', enum: [false] },
  },
  required: [
    'summary',
    'nextChecks',
    'safetyWarnings',
    'limitations',
    'humanVerificationRequired',
    'finalDiagnosisProvided',
    'repairApprovalProvided',
  ],
  additionalProperties: false,
} as const;

const SYSTEM_INSTRUCTIONS = [
  'You are the controlled PowerMech AI Repair Mentor provider adapter.',
  'Use only the supplied diagnostic snapshot.',
  'Return next diagnostic checks only.',
  'Never provide a final diagnosis, repair approval, parts decision, warranty decision, or safety certification.',
  'Human mechanic verification is always required.',
  'Do not claim knowledge retrieval or access to manuals.',
].join(' ');

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const extractOutputText = (payload: unknown): string | null => {
  if (!isRecord(payload) || !Array.isArray(payload.output)) return null;

  for (const item of payload.output) {
    if (!isRecord(item) || !Array.isArray(item.content)) continue;
    for (const contentItem of item.content) {
      if (
        isRecord(contentItem) &&
        contentItem.type === 'output_text' &&
        typeof contentItem.text === 'string'
      ) {
        return contentItem.text;
      }
    }
  }
  return null;
};

@Injectable()
export class OpenAiProvider implements AiGatewayProvider {
  readonly providerKey = OPENAI_PROVIDER_KEY;
  readonly realProvider = true;

  constructor(private readonly configService: ConfigService) {}

  async invokeRepairMentor(
    request: RepairMentorGatewayRequest,
  ): Promise<unknown> {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY')?.trim();
    const model = this.configService.get<string>('OPENAI_MODEL')?.trim();
    if (!apiKey || !model) {
      throw new Error('OpenAI provider configuration is incomplete.');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      let response: Response;
      try {
        response = await fetch(OPENAI_RESPONSES_URL, {
          method: 'POST',
          headers: {
            accept: 'application/json',
            authorization: `Bearer ${apiKey}`,
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            model,
            store: false,
            instructions: SYSTEM_INSTRUCTIONS,
            input: JSON.stringify(request),
            max_output_tokens: 800,
            text: {
              format: {
                type: 'json_schema',
                name: 'controlled_repair_mentor',
                strict: true,
                schema: CONTROLLED_REPAIR_MENTOR_SCHEMA,
              },
            },
          }),
          redirect: 'error',
          signal: controller.signal,
        });
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('OpenAI provider request timed out.');
        }
        throw new Error('OpenAI provider request failed.');
      }

      if (!response.ok) {
        throw new Error(
          `OpenAI provider request failed with HTTP ${response.status}.`,
        );
      }

      let payload: unknown;
      try {
        payload = await response.json();
      } catch {
        throw new Error('OpenAI provider returned invalid JSON.');
      }

      const outputText = extractOutputText(payload);
      if (!outputText) {
        throw new Error('OpenAI provider returned no structured output.');
      }

      try {
        return JSON.parse(outputText) as unknown;
      } catch {
        throw new Error('OpenAI provider structured output was invalid JSON.');
      }
    } finally {
      clearTimeout(timeout);
    }
  }
}
