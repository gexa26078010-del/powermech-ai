exports.up = (pgm) => {
  pgm.createTable('ai_gateway_invocations', {
    id: { type: 'uuid', primaryKey: true },
    workspace_id: { type: 'uuid', notNull: true, references: 'workspaces' },
    repair_case_id: { type: 'uuid', notNull: true, references: 'repair_cases' },
    prompt_version: { type: 'text', notNull: true },
    provider_key: { type: 'text', notNull: true },
    invocation_type: { type: 'text', notNull: true },
    request_payload: { type: 'jsonb', notNull: true },
    response_payload: { type: 'jsonb', notNull: true },
    status: { type: 'text', notNull: true },
    error_message: { type: 'text' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
  pgm.addConstraint('ai_gateway_invocations', 'ai_gateway_invocations_status_check', {
    check: "status IN ('succeeded', 'failed')",
  });
  pgm.addConstraint('ai_gateway_invocations', 'ai_gateway_invocations_provider_check', {
    check: "provider_key = 'deterministic_stub'",
  });
  pgm.addConstraint('ai_gateway_invocations', 'ai_gateway_invocations_prompt_version_check', {
    check: "prompt_version = 'repair_mentor_first_scenario_v1'",
  });
  pgm.addConstraint('ai_gateway_invocations', 'ai_gateway_invocations_type_check', {
    check: "invocation_type = 'repair_mentor_first_scenario'",
  });
  pgm.addConstraint('ai_gateway_invocations', 'ai_gateway_invocations_workspace_case_fk', {
    foreignKeys: {
      columns: ['workspace_id', 'repair_case_id'],
      references: 'repair_cases(workspace_id, id)',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('ai_gateway_invocations');
};
