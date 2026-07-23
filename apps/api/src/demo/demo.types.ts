export interface DemoWorkspaceResponse {
  workspace: { slug: string; name: string; status: string };
  owner: { email: string; displayName: string };
  membership: { role: string };
  boundaries: {
    privateWorkspace: true;
    sharedKnowledgeImplemented: false;
    globalKnowledgeImplemented: false;
  };
}

export interface DemoRepairCaseResponse {
  workspace: { slug: string; name: string };
  vehicle: {
    brand: string;
    model: string;
    modelYear: number;
    vehicleFamily: string;
    vin: string;
  };
  repairCase: {
    caseNumber: string;
    customerComplaint: string;
    status: string;
    scenarioKey: string;
  };
  boundaries: {
    workspaceScoped: true;
    diagnosticsImplemented: false;
    repairMentorImplemented: false;
    sharedKnowledgeImplemented: false;
    globalKnowledgeImplemented: false;
  };
}

export interface DemoDiagnosticMeasurementResponse {
  measurementKey: string;
  label: string;
  valueNumeric: number | null;
  valueText: string | null;
  unit: string | null;
}

export interface DemoDiagnosticCheckResponse {
  checkKey: string;
  title: string;
  status: string;
  result: string;
  mechanicNote: string | null;
  measurements: DemoDiagnosticMeasurementResponse[];
}

export interface DemoDiagnosticContextResponse {
  workspace: { slug: string };
  repairCase: {
    caseNumber: string;
    scenarioKey: string;
    customerComplaint: string;
  };
  diagnosticChecks: DemoDiagnosticCheckResponse[];
  boundaries: {
    workspaceScoped: true;
    repairCaseScoped: true;
    aiImplemented: false;
    repairMentorImplemented: false;
    sharedKnowledgeImplemented: false;
    globalKnowledgeImplemented: false;
  };
}
