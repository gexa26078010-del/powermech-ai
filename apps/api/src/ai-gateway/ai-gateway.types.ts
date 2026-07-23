export const DETERMINISTIC_STUB_PROVIDER_KEY = 'deterministic_stub' as const;
export const REPAIR_MENTOR_PROMPT_VERSION = 'repair_mentor_first_scenario_v1' as const;
export const REPAIR_MENTOR_INVOCATION_TYPE = 'repair_mentor_first_scenario' as const;

export interface AiGatewayDiagnosticCheck {
  checkKey: string;
  status: string;
  result: string;
  mechanicNote: string | null;
}

export interface RepairMentorGatewayRequest {
  workspace: {
    slug: string;
  };
  repairCase: {
    caseNumber: string;
    scenarioKey: string;
    customerComplaint: string;
  };
  diagnosticChecks: AiGatewayDiagnosticCheck[];
}

export interface AiGatewayInvocationScope {
  workspaceId: string;
  repairCaseId: string;
}

export interface RepairMentorNextCheck {
  checkKey: string;
  title: string;
  reason: string;
  priority: number;
}

export interface ControlledRepairMentorOutput {
  summary: string;
  nextChecks: RepairMentorNextCheck[];
  safetyWarnings: string[];
  limitations: string[];
  humanVerificationRequired: true;
  finalDiagnosisProvided: false;
  repairApprovalProvided: false;
}

export interface AiGatewayInvocationSuccess {
  providerKey: typeof DETERMINISTIC_STUB_PROVIDER_KEY;
  promptVersion: typeof REPAIR_MENTOR_PROMPT_VERSION;
  invocationType: typeof REPAIR_MENTOR_INVOCATION_TYPE;
  status: 'succeeded';
  repairMentor: ControlledRepairMentorOutput;
}
