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
