import { RequestMethod } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { RepairMentorController } from './repair-mentor.controller';
import { RepairMentorService } from './repair-mentor.service';

describe('RepairMentorController', () => {
  it('exposes POST /demo/repair-mentor/invoke with the controlled response', async () => {
    const response = {
      workspace: { slug: 'demo-powersport-service' },
      repairCase: {
        caseNumber: 'DEMO-RC-0001',
        scenarioKey: 'starter_cranks_engine_no_start',
        customerComplaint: 'Starter cranks, engine does not start',
      },
      invocation: {
        providerKey: 'deterministic_stub' as const,
        promptVersion: 'repair_mentor_first_scenario_v1' as const,
        invocationType: 'repair_mentor_first_scenario' as const,
        status: 'succeeded' as const,
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
        humanVerificationRequired: true as const,
        finalDiagnosisProvided: false as const,
        repairApprovalProvided: false as const,
      },
      boundaries: {
        workspaceScoped: true as const,
        repairCaseScoped: true as const,
        diagnosticContextUsed: true as const,
        realProviderUsed: false as const,
        knowledgeRetrievalUsed: false as const,
        finalDiagnosisProvided: false as const,
        repairApprovalProvided: false as const,
        sharedKnowledgeImplemented: false as const,
        globalKnowledgeImplemented: false as const,
      },
    };
    const service = {
      invokeDemo: jest.fn().mockResolvedValue(response),
    } as unknown as RepairMentorService;

    await expect(new RepairMentorController(service).invoke()).resolves.toEqual(response);
    expect(Reflect.getMetadata(PATH_METADATA, RepairMentorController)).toBe(
      'demo/repair-mentor',
    );
    expect(Reflect.getMetadata(PATH_METADATA, RepairMentorController.prototype.invoke)).toBe(
      'invoke',
    );
    expect(
      Reflect.getMetadata(METHOD_METADATA, RepairMentorController.prototype.invoke),
    ).toBe(RequestMethod.POST);
  });
});
