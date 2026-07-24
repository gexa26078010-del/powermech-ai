import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { AiGatewayProvider } from './ai-provider.interface';
import { AiProviderSelector } from './ai-provider.selector';
import {
  AiGatewayService,
  ControlledAiGatewayInvocationError,
} from './ai-gateway.service';
import {
  DETERMINISTIC_STUB_PROVIDER_KEY,
  INVALID_CONFIGURATION_PROVIDER_KEY,
  OPENAI_PROVIDER_KEY,
  REPAIR_MENTOR_INVOCATION_TYPE,
  REPAIR_MENTOR_PROMPT_VERSION,
  RepairMentorGatewayRequest,
} from './ai-gateway.types';
import { DeterministicStubProvider } from './deterministic-stub.provider';
import { OpenAiProvider } from './openai.provider';

const scope = {
  workspaceId: '00000000-0000-4000-8000-000000000001',
  repairCaseId: '00000000-0000-4000-8000-000000000005',
};

const demoRequest = (): RepairMentorGatewayRequest => ({
  workspace: { slug: 'demo-powersport-service' },
  repairCase: {
    caseNumber: 'DEMO-RC-0001',
    scenarioKey: 'starter_cranks_engine_no_start',
    customerComplaint: 'Starter cranks, engine does not start',
  },
  diagnosticChecks: [
    {
      checkKey: 'battery_voltage_static',
      status: 'recorded',
      result: 'pass',
      mechanicNote: 'Static battery voltage is within acceptable demo range.',
    },
    {
      checkKey: 'fuel_pump_prime',
      status: 'recorded',
      result: 'unknown',
      mechanicNote: 'Fuel pump prime sound not confirmed in demo seed.',
    },
    {
      checkKey: 'spark_presence',
      status: 'recorded',
      result: 'not_checked',
      mechanicNote: 'Spark presence has not been checked yet in demo seed.',
    },
  ],
});

const controlledOutput = {
  summary: 'Controlled next-check guidance.',
  nextChecks: [
    {
      checkKey: 'fuel_pump_prime_confirm',
      title: 'Confirm fuel pump prime',
      reason: 'Fuel pump prime remains unknown.',
      priority: 1,
    },
  ],
  safetyWarnings: ['Human verification is required.'],
  limitations: ['This is not a final diagnosis.'],
  humanVerificationRequired: true as const,
  finalDiagnosisProvided: false as const,
  repairApprovalProvided: false as const,
};

const createService = (configuration: Record<string, string> = {}) => {
  const query = jest.fn().mockResolvedValue({ rows: [] });
  const pool = { query } as unknown as Pool;
  const configService = new ConfigService(configuration);
  const selector = new AiProviderSelector(
    configService,
    new DeterministicStubProvider(),
    new OpenAiProvider(configService),
  );
  return {
    service: new AiGatewayService(selector, pool),
    query,
  };
};

describe('AiGatewayService', () => {
  it('returns the exact controlled deterministic provider result after logging it', async () => {
    const { service, query } = createService();
    const result = await service.invokeRepairMentor(scope, demoRequest());

    expect(result.providerKey).toBe(DETERMINISTIC_STUB_PROVIDER_KEY);
    expect(result.promptVersion).toBe(REPAIR_MENTOR_PROMPT_VERSION);
    expect(result.invocationType).toBe(REPAIR_MENTOR_INVOCATION_TYPE);
    expect(result.status).toBe('succeeded');
    expect(result.realProviderUsed).toBe(false);
    expect(result.repairMentor.humanVerificationRequired).toBe(true);
    expect(result.repairMentor.finalDiagnosisProvided).toBe(false);
    expect(result.repairMentor.repairApprovalProvided).toBe(false);
    expect(result.repairMentor.nextChecks.map((check) => check.checkKey)).toEqual([
      'fuel_pump_prime_confirm',
      'spark_presence_check',
    ]);
    expect(JSON.stringify(result.repairMentor)).not.toMatch(
      /replace fuel pump|replace ecu|the final cause is/i,
    );
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO ai_gateway_invocations'),
      expect.arrayContaining([
        scope.workspaceId,
        scope.repairCaseId,
        REPAIR_MENTOR_PROMPT_VERSION,
        DETERMINISTIC_STUB_PROVIDER_KEY,
        REPAIR_MENTOR_INVOCATION_TYPE,
      ]),
    );
  });

  it('logs and refuses diagnostic context outside the controlled first scenario', async () => {
    const { service, query } = createService();
    const request = demoRequest();
    request.diagnosticChecks[1].result = 'pass';

    await expect(service.invokeRepairMentor(scope, request)).rejects.toBeInstanceOf(
      ControlledAiGatewayInvocationError,
    );
    const insertParameters = query.mock.calls[0][1] as unknown[];
    expect(insertParameters[7]).toEqual({});
    expect(insertParameters[8]).toBe('failed');
    expect(insertParameters[9]).toBe(
      'Deterministic stub received unsupported diagnostic context.',
    );
  });

  it('refuses a different repair-case scenario', async () => {
    const { service } = createService();
    const request = demoRequest();
    request.repairCase.scenarioKey = 'different_scenario';

    await expect(service.invokeRepairMentor(scope, request)).rejects.toBeInstanceOf(
      ControlledAiGatewayInvocationError,
    );
  });

  it('refuses additional diagnostic checks outside the controlled contract', async () => {
    const { service } = createService();
    const request = demoRequest();
    request.diagnosticChecks.push({
      checkKey: 'unexpected_check',
      status: 'recorded',
      result: 'unknown',
      mechanicNote: null,
    });

    await expect(service.invokeRepairMentor(scope, request)).rejects.toBeInstanceOf(
      ControlledAiGatewayInvocationError,
    );
  });

  it('logs and fails closed when OpenAI is selected without a key', async () => {
    const { service, query } = createService({
      AI_PROVIDER: OPENAI_PROVIDER_KEY,
      OPENAI_MODEL: 'gpt-5-mini',
    });

    await expect(
      service.invokeRepairMentor(scope, demoRequest()),
    ).rejects.toBeInstanceOf(ControlledAiGatewayInvocationError);

    const insertParameters = query.mock.calls[0][1] as unknown[];
    expect(insertParameters[4]).toBe(OPENAI_PROVIDER_KEY);
    expect(insertParameters[7]).toEqual({});
    expect(insertParameters[8]).toBe('failed');
    expect(insertParameters[9]).toBe(
      'OpenAI provider configuration is incomplete.',
    );
  });

  it('logs unsupported provider configuration without echoing its value', async () => {
    const { service, query } = createService({
      AI_PROVIDER: 'untrusted-provider-value',
    });

    await expect(
      service.invokeRepairMentor(scope, demoRequest()),
    ).rejects.toBeInstanceOf(ControlledAiGatewayInvocationError);

    const insertParameters = query.mock.calls[0][1] as unknown[];
    expect(insertParameters[4]).toBe(INVALID_CONFIGURATION_PROVIDER_KEY);
    expect(insertParameters[9]).toBe('AI provider configuration is unsupported.');
    expect(String(insertParameters[9])).not.toContain('untrusted-provider-value');
  });

  it('marks realProviderUsed only after a successful real-provider result', async () => {
    const provider: AiGatewayProvider = {
      providerKey: OPENAI_PROVIDER_KEY,
      realProvider: true,
      invokeRepairMentor: jest.fn().mockResolvedValue(controlledOutput),
    };
    const selector = {
      select: jest.fn().mockReturnValue(provider),
    } as unknown as AiProviderSelector;
    const query = jest.fn().mockResolvedValue({ rows: [] });
    const service = new AiGatewayService(
      selector,
      { query } as unknown as Pool,
    );

    const result = await service.invokeRepairMentor(scope, demoRequest());

    expect(result.providerKey).toBe(OPENAI_PROVIDER_KEY);
    expect(result.realProviderUsed).toBe(true);
    const insertParameters = query.mock.calls[0][1] as unknown[];
    expect(insertParameters[4]).toBe(OPENAI_PROVIDER_KEY);
    expect(insertParameters[8]).toBe('succeeded');
  });

  it('audits and rejects invalid provider output', async () => {
    const provider: AiGatewayProvider = {
      providerKey: OPENAI_PROVIDER_KEY,
      realProvider: true,
      invokeRepairMentor: jest.fn().mockResolvedValue({
        ...controlledOutput,
        finalDiagnosisProvided: true,
      }),
    };
    const selector = {
      select: jest.fn().mockReturnValue(provider),
    } as unknown as AiProviderSelector;
    const query = jest.fn().mockResolvedValue({ rows: [] });
    const service = new AiGatewayService(
      selector,
      { query } as unknown as Pool,
    );

    await expect(
      service.invokeRepairMentor(scope, demoRequest()),
    ).rejects.toBeInstanceOf(ControlledAiGatewayInvocationError);

    const insertParameters = query.mock.calls[0][1] as unknown[];
    expect(insertParameters[4]).toBe(OPENAI_PROVIDER_KEY);
    expect(insertParameters[7]).toEqual({});
    expect(insertParameters[8]).toBe('failed');
    expect(insertParameters[9]).toBe(
      'Provider output failed controlled Repair Mentor validation.',
    );
  });
});
