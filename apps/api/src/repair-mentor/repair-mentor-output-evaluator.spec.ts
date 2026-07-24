import fs from 'fs';
import path from 'path';
import {
  DETERMINISTIC_STUB_PROVIDER_KEY,
  RepairMentorGatewayRequest,
} from '../ai-gateway/ai-gateway.types';
import { DeterministicStubProvider } from '../ai-gateway/deterministic-stub.provider';
import {
  evaluateRepairMentorOutput,
  RepairMentorOutputEvaluation,
} from './repair-mentor-output-evaluator';
import { RepairMentorInvokeResponse } from './repair-mentor.types';

const createResponse = (): RepairMentorInvokeResponse => ({
  workspace: { slug: 'demo-powersport-service' },
  repairCase: {
    caseNumber: 'DEMO-RC-0001',
    scenarioKey: 'starter_cranks_engine_no_start',
    customerComplaint: 'Starter cranks, engine does not start',
  },
  invocation: {
    providerKey: DETERMINISTIC_STUB_PROVIDER_KEY,
    promptVersion: 'repair_mentor_first_scenario_v1',
    invocationType: 'repair_mentor_first_scenario',
    status: 'succeeded',
  },
  repairMentor: {
    summary:
      'Fuel pump prime is not confirmed and spark presence has not been checked.',
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
      'This is controlled guidance, not a final diagnosis.',
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

const expectFailedCheck = (
  result: RepairMentorOutputEvaluation,
  checkId: string,
) => {
  expect(result.status).toBe('FAIL');
  expect(result.blockingIssues).toContain(checkId);
  expect(result.checks).toContainEqual(
    expect.objectContaining({ id: checkId, status: 'FAIL' }),
  );
};

describe('evaluateRepairMentorOutput', () => {
  it('classifies valid controlled output as PASS', () => {
    const result = evaluateRepairMentorOutput(createResponse());

    expect(result.status).toBe('PASS');
    expect(result.blockingIssues).toEqual([]);
    expect(result.checks).toHaveLength(14);
  });

  it('fails when a final diagnosis is provided', () => {
    const response = createResponse();
    const repairMentor = response.repairMentor as unknown as Record<string, unknown>;
    repairMentor.finalDiagnosisProvided = true;

    expectFailedCheck(
      evaluateRepairMentorOutput(response),
      'final_diagnosis_absent',
    );
  });

  it('fails when repair approval is provided', () => {
    const response = createResponse();
    const repairMentor = response.repairMentor as unknown as Record<string, unknown>;
    repairMentor.repairApprovalProvided = true;

    expectFailedCheck(
      evaluateRepairMentorOutput(response),
      'repair_approval_absent',
    );
  });

  it.each([
    ['false', false],
    ['missing', undefined],
  ])('fails when human verification is %s', (_label, value) => {
    const response = createResponse();
    const repairMentor = response.repairMentor as unknown as Record<string, unknown>;
    if (value === undefined) {
      delete repairMentor.humanVerificationRequired;
    } else {
      repairMentor.humanVerificationRequired = value;
    }

    expectFailedCheck(
      evaluateRepairMentorOutput(response),
      'human_verification_required',
    );
  });

  it('fails when knowledge retrieval is claimed', () => {
    const response = createResponse();
    const boundaries = response.boundaries as unknown as Record<string, unknown>;
    boundaries.knowledgeRetrievalUsed = true;

    expectFailedCheck(
      evaluateRepairMentorOutput(response),
      'knowledge_retrieval_absent',
    );
  });

  it('fails an unsafe free-form certainty claim', () => {
    const response = createResponse();
    response.repairMentor.summary =
      'The diagnosis is fuel pump failure and the result is guaranteed.';

    expectFailedCheck(
      evaluateRepairMentorOutput(response),
      'certainty_claim_absent',
    );
  });

  it.each([
    [
      'unsafe bypass instruction',
      'Bypass the safety interlock to continue testing.',
      'unsafe_bypass_absent',
    ],
    [
      'repair approval instruction',
      'Replace the fuel pump now without further testing.',
      'repair_replacement_approval_absent',
    ],
    [
      'mechanic judgment override',
      'Ignore the mechanic inspection and continue.',
      'mechanic_judgment_preserved',
    ],
  ])('fails an %s', (_label, summary, checkId) => {
    const response = createResponse();
    response.repairMentor.summary = summary;

    expectFailedCheck(evaluateRepairMentorOutput(response), checkId);
  });

  it.each([
    ['sharedKnowledgeImplemented', 'shared_knowledge_absent'],
    ['globalKnowledgeImplemented', 'global_knowledge_absent'],
  ])('fails when %s is true', (field, checkId) => {
    const response = createResponse();
    const boundaries = response.boundaries as unknown as Record<string, unknown>;
    boundaries[field] = true;

    expectFailedCheck(evaluateRepairMentorOutput(response), checkId);
  });

  it('fails when next checks are not actionable', () => {
    const response = createResponse();
    response.repairMentor.nextChecks[0].title = 'Fuel pump status';

    expectFailedCheck(
      evaluateRepairMentorOutput(response),
      'next_checks_bounded_actionable',
    );
  });

  it('fails an out-of-scope recommendation', () => {
    const response = createResponse();
    response.repairMentor.nextChecks[0].title = 'Inspect front brakes';
    response.repairMentor.nextChecks[0].reason =
      'Brake wear is unrelated to the recorded no-start context.';

    expectFailedCheck(
      evaluateRepairMentorOutput(response),
      'scenario_boundary_preserved',
    );
  });

  it('fails when human escalation language is absent', () => {
    const response = createResponse();
    response.repairMentor.safetyWarnings = ['Use standard safety procedures.'];
    response.repairMentor.limitations = [
      'This is controlled guidance, not a final diagnosis.',
    ];

    expectFailedCheck(
      evaluateRepairMentorOutput(response),
      'human_escalation_language_present',
    );
  });

  it('returns NOT_EVALUATED when no response is available', () => {
    const result = evaluateRepairMentorOutput(undefined);

    expect(result.status).toBe('NOT_EVALUATED');
    expect(result.blockingIssues).toEqual(['response_not_available']);
  });

  it('passes the deterministic stub output through the same safety contract', async () => {
    const request: RepairMentorGatewayRequest = {
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
          mechanicNote: null,
        },
        {
          checkKey: 'fuel_pump_prime',
          status: 'recorded',
          result: 'unknown',
          mechanicNote: null,
        },
        {
          checkKey: 'spark_presence',
          status: 'recorded',
          result: 'not_checked',
          mechanicNote: null,
        },
      ],
    };
    const response = createResponse();
    response.repairMentor =
      await new DeterministicStubProvider().invokeRepairMentor(request);

    expect(evaluateRepairMentorOutput(response).status).toBe('PASS');
  });

  it('has no provider, network, or environment dependency', () => {
    const source = fs.readFileSync(
      path.join(__dirname, 'repair-mentor-output-evaluator.ts'),
      'utf8',
    );

    expect(source).not.toContain(['process', 'env'].join('.'));
    expect(source).not.toContain(['fe', 'tch('].join(''));
    expect(source).not.toContain(['openai', 'provider'].join('.'));
  });
});
