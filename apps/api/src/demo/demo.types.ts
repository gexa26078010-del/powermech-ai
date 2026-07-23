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
