import { ServiceUnavailableException } from '@nestjs/common';
import { Pool } from 'pg';
import { AiGatewayService } from '../ai-gateway/ai-gateway.service';
import { DeterministicStubProvider } from '../ai-gateway/deterministic-stub.provider';
import { RepairMentorService } from './repair-mentor.service';

const contextRows = () => [
  {
    workspace_id: '00000000-0000-4000-8000-000000000001',
    repair_case_id: '00000000-0000-4000-8000-000000000005',
    slug: 'demo-powersport-service',
    case_number: 'DEMO-RC-0001',
    scenario_key: 'starter_cranks_engine_no_start',
    customer_complaint: 'Starter cranks, engine does not start',
    check_key: 'battery_voltage_static',
    status: 'recorded',
    result: 'pass',
    mechanic_note: 'Static battery voltage is within acceptable demo range.',
  },
  {
    workspace_id: '00000000-0000-4000-8000-000000000001',
    repair_case_id: '00000000-0000-4000-8000-000000000005',
    slug: 'demo-powersport-service',
    case_number: 'DEMO-RC-0001',
    scenario_key: 'starter_cranks_engine_no_start',
    customer_complaint: 'Starter cranks, engine does not start',
    check_key: 'fuel_pump_prime',
    status: 'recorded',
    result: 'unknown',
    mechanic_note: 'Fuel pump prime sound not confirmed in demo seed.',
  },
  {
    workspace_id: '00000000-0000-4000-8000-000000000001',
    repair_case_id: '00000000-0000-4000-8000-000000000005',
    slug: 'demo-powersport-service',
    case_number: 'DEMO-RC-0001',
    scenario_key: 'starter_cranks_engine_no_start',
    customer_complaint: 'Starter cranks, engine does not start',
    check_key: 'spark_presence',
    status: 'recorded',
    result: 'not_checked',
    mechanic_note: 'Spark presence has not been checked yet in demo seed.',
  },
];

const createService = (rows = contextRows()) => {
  const query = jest
    .fn()
    .mockResolvedValueOnce({ rows })
    .mockResolvedValueOnce({ rows: [] });
  const pool = { query } as unknown as Pool;
  const gateway = new AiGatewayService(new DeterministicStubProvider(), pool);
  return { service: new RepairMentorService(pool, gateway), query };
};

describe('RepairMentorService', () => {
  it('returns and logs the controlled workspace-scoped invocation', async () => {
    const { service, query } = createService();

    await expect(service.invokeDemo()).resolves.toEqual({
      workspace: { slug: 'demo-powersport-service' },
      repairCase: {
        caseNumber: 'DEMO-RC-0001',
        scenarioKey: 'starter_cranks_engine_no_start',
        customerComplaint: 'Starter cranks, engine does not start',
      },
      invocation: {
        providerKey: 'deterministic_stub',
        promptVersion: 'repair_mentor_first_scenario_v1',
        invocationType: 'repair_mentor_first_scenario',
        status: 'succeeded',
      },
      repairMentor: {
        summary:
          'Battery voltage is acceptable in the demo diagnostic context. Fuel pump prime is not confirmed and spark presence has not been checked.',
        nextChecks: [
          {
            checkKey: 'fuel_pump_prime_confirm',
            title: 'Confirm fuel pump prime',
            reason: 'Fuel pump prime is unknown in the recorded diagnostic context.',
            priority: 1,
          },
          {
            checkKey: 'spark_presence_check',
            title: 'Check spark presence',
            reason: 'Spark presence has not been checked yet.',
            priority: 2,
          },
        ],
        safetyWarnings: [
          'Do not bypass safety procedures.',
          'Human mechanic verification is required before any repair decision.',
        ],
        limitations: [
          'This is controlled demo guidance, not a final diagnosis.',
          'No parts replacement decision is made by the system.',
        ],
        humanVerificationRequired: true,
        finalDiagnosisProvided: false,
        repairApprovalProvided: false,
      },
      boundaries: {
        workspaceScoped: true,
        repairCaseScoped: true,
        diagnosticContextUsed: true,
        realProviderUsed: false,
        knowledgeRetrievalUsed: false,
        finalDiagnosisProvided: false,
        repairApprovalProvided: false,
        sharedKnowledgeImplemented: false,
        globalKnowledgeImplemented: false,
      },
    });
    expect(query).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('ORDER BY dc.check_key ASC'),
      ['demo-powersport-service', 'DEMO-RC-0001', 'starter_cranks_engine_no_start'],
    );
    expect(query.mock.calls[0][0]).toEqual(
      expect.stringContaining(
        'dc.workspace_id = w.id AND dc.repair_case_id = rc.id',
      ),
    );
    expect(query).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('INSERT INTO ai_gateway_invocations'),
      expect.any(Array),
    );
    const insertParameters = query.mock.calls[1][1] as unknown[];
    expect(insertParameters.slice(1, 6)).toEqual([
      '00000000-0000-4000-8000-000000000001',
      '00000000-0000-4000-8000-000000000005',
      'repair_mentor_first_scenario_v1',
      'deterministic_stub',
      'repair_mentor_first_scenario',
    ]);
    expect(insertParameters[6]).toEqual(
      expect.objectContaining({
        workspace: { slug: 'demo-powersport-service' },
        repairCase: expect.objectContaining({ caseNumber: 'DEMO-RC-0001' }),
        diagnosticChecks: expect.arrayContaining([
          expect.objectContaining({ checkKey: 'battery_voltage_static', result: 'pass' }),
          expect.objectContaining({ checkKey: 'fuel_pump_prime', result: 'unknown' }),
          expect.objectContaining({ checkKey: 'spark_presence', result: 'not_checked' }),
        ]),
      }),
    );
    expect(insertParameters[7]).toEqual(
      expect.objectContaining({
        humanVerificationRequired: true,
        finalDiagnosisProvided: false,
        repairApprovalProvided: false,
      }),
    );
    expect(insertParameters[8]).toBe('succeeded');
    expect(insertParameters[9]).toBeNull();
    expect(query).toHaveBeenCalledTimes(2);
  });

  it('logs a failed controlled invocation when context is unsupported', async () => {
    const rows = contextRows();
    rows[1].result = 'pass';
    const { service, query } = createService(rows);

    await expect(service.invokeDemo()).rejects.toBeInstanceOf(ServiceUnavailableException);
    const insertParameters = query.mock.calls[1][1] as unknown[];
    expect(insertParameters[7]).toEqual({});
    expect(insertParameters[8]).toBe('failed');
    expect(insertParameters[9]).toBe(
      'Deterministic stub received unsupported diagnostic context.',
    );
    expect(query).toHaveBeenCalledTimes(2);
  });

  it('does not return guidance when the invocation audit row cannot be persisted', async () => {
    const query = jest
      .fn()
      .mockResolvedValueOnce({ rows: contextRows() })
      .mockRejectedValueOnce(new Error('Invocation log unavailable'));
    const pool = { query } as unknown as Pool;
    const gateway = new AiGatewayService(new DeterministicStubProvider(), pool);
    const service = new RepairMentorService(pool, gateway);

    await expect(service.invokeDemo()).rejects.toThrow('Invocation log unavailable');
    expect(query).toHaveBeenCalledTimes(2);
  });
});
