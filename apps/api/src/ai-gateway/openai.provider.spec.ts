import { ConfigService } from '@nestjs/config';
import { RepairMentorGatewayRequest } from './ai-gateway.types';
import { OpenAiProvider } from './openai.provider';

const request: RepairMentorGatewayRequest = {
  workspace: { slug: 'demo-powersport-service' },
  repairCase: {
    caseNumber: 'DEMO-RC-0001',
    scenarioKey: 'starter_cranks_engine_no_start',
    customerComplaint: 'Starter cranks, engine does not start',
  },
  diagnosticChecks: [
    {
      checkKey: 'fuel_pump_prime',
      status: 'recorded',
      result: 'unknown',
      mechanicNote: null,
    },
  ],
};

const controlledOutput = {
  summary: 'Two next checks remain.',
  nextChecks: [
    {
      checkKey: 'fuel_pump_prime_confirm',
      title: 'Confirm fuel pump prime',
      reason: 'The recorded state is unknown.',
      priority: 1,
    },
  ],
  safetyWarnings: ['Human verification is required.'],
  limitations: ['This is not a final diagnosis.'],
  humanVerificationRequired: true,
  finalDiagnosisProvided: false,
  repairApprovalProvided: false,
};

const createProvider = () =>
  new OpenAiProvider(
    new ConfigService({
      OPENAI_API_KEY: 'test-api-key',
      OPENAI_MODEL: 'gpt-5-mini',
    }),
  );

describe('OpenAiProvider', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('uses native fetch with a strict structured-output request', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({
        output: [
          {
            type: 'message',
            content: [
              {
                type: 'output_text',
                text: JSON.stringify(controlledOutput),
              },
            ],
          },
        ],
      }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    await expect(createProvider().invokeRepairMentor(request)).resolves.toEqual(
      controlledOutput,
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.openai.com/v1/responses');
    expect(init.method).toBe('POST');
    expect(init.headers).toMatchObject({
      authorization: 'Bearer test-api-key',
      'content-type': 'application/json',
    });
    const body = JSON.parse(String(init.body)) as {
      model: string;
      store: boolean;
      input: string;
      text: { format: { type: string; strict: boolean } };
    };
    expect(body.model).toBe('gpt-5-mini');
    expect(body.store).toBe(false);
    expect(body.input).toBe(JSON.stringify(request));
    expect(body.text.format).toMatchObject({
      type: 'json_schema',
      strict: true,
    });
  });

  it('returns a safe error without exposing the provider response body', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
    }) as unknown as typeof fetch;

    await expect(createProvider().invokeRepairMentor(request)).rejects.toThrow(
      'OpenAI provider request failed with HTTP 401.',
    );
  });

  it('fails closed when no structured output is returned', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({
        output: [{ type: 'message', content: [{ type: 'refusal' }] }],
      }),
    }) as unknown as typeof fetch;

    await expect(createProvider().invokeRepairMentor(request)).rejects.toThrow(
      'OpenAI provider returned no structured output.',
    );
  });

  it('does not call the network when configuration is incomplete', async () => {
    const fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
    const provider = new OpenAiProvider(
      new ConfigService({ OPENAI_MODEL: 'gpt-5-mini' }),
    );

    await expect(provider.invokeRepairMentor(request)).rejects.toThrow(
      'OpenAI provider configuration is incomplete.',
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
