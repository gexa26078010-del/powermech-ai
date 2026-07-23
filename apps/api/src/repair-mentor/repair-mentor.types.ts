import {
  ControlledRepairMentorOutput,
  DETERMINISTIC_STUB_PROVIDER_KEY,
  REPAIR_MENTOR_INVOCATION_TYPE,
  REPAIR_MENTOR_PROMPT_VERSION,
} from '../ai-gateway/ai-gateway.types';

export interface RepairMentorInvokeResponse {
  workspace: {
    slug: string;
  };
  repairCase: {
    caseNumber: string;
    scenarioKey: string;
    customerComplaint: string;
  };
  invocation: {
    providerKey: typeof DETERMINISTIC_STUB_PROVIDER_KEY;
    promptVersion: typeof REPAIR_MENTOR_PROMPT_VERSION;
    invocationType: typeof REPAIR_MENTOR_INVOCATION_TYPE;
    status: 'succeeded';
  };
  repairMentor: ControlledRepairMentorOutput;
  boundaries: {
    workspaceScoped: true;
    repairCaseScoped: true;
    diagnosticContextUsed: true;
    realProviderUsed: false;
    knowledgeRetrievalUsed: false;
    finalDiagnosisProvided: false;
    repairApprovalProvided: false;
    sharedKnowledgeImplemented: false;
    globalKnowledgeImplemented: false;
  };
}
