exports.up = (pgm) => {
  pgm.addConstraint('repair_cases', 'repair_cases_workspace_id_id_unique', {
    unique: ['workspace_id', 'id'],
  });

  pgm.createTable('diagnostic_checks', {
    id: { type: 'uuid', primaryKey: true },
    workspace_id: { type: 'uuid', notNull: true, references: 'workspaces' },
    repair_case_id: { type: 'uuid', notNull: true, references: 'repair_cases' },
    check_key: { type: 'text', notNull: true },
    title: { type: 'text', notNull: true },
    status: { type: 'text', notNull: true },
    result: { type: 'text', notNull: true },
    mechanic_note: { type: 'text' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
  pgm.addConstraint('diagnostic_checks', 'diagnostic_checks_workspace_case_key_unique', {
    unique: ['workspace_id', 'repair_case_id', 'check_key'],
  });
  pgm.addConstraint('diagnostic_checks', 'diagnostic_checks_workspace_case_id_unique', {
    unique: ['workspace_id', 'repair_case_id', 'id'],
  });
  pgm.addConstraint('diagnostic_checks', 'diagnostic_checks_status_check', {
    check: "status = 'recorded'",
  });
  pgm.addConstraint('diagnostic_checks', 'diagnostic_checks_result_check', {
    check: "result IN ('pass', 'fail', 'unknown', 'not_checked')",
  });
  pgm.addConstraint('diagnostic_checks', 'diagnostic_checks_workspace_repair_case_fk', {
    foreignKeys: {
      columns: ['workspace_id', 'repair_case_id'],
      references: 'repair_cases(workspace_id, id)',
    },
  });

  pgm.createTable('diagnostic_measurements', {
    id: { type: 'uuid', primaryKey: true },
    workspace_id: { type: 'uuid', notNull: true, references: 'workspaces' },
    repair_case_id: { type: 'uuid', notNull: true, references: 'repair_cases' },
    diagnostic_check_id: { type: 'uuid', notNull: true, references: 'diagnostic_checks' },
    measurement_key: { type: 'text', notNull: true },
    label: { type: 'text', notNull: true },
    value_numeric: { type: 'numeric(18,6)' },
    value_text: { type: 'text' },
    unit: { type: 'text' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
  pgm.addConstraint('diagnostic_measurements', 'diagnostic_measurements_scope_key_unique', {
    unique: ['workspace_id', 'repair_case_id', 'diagnostic_check_id', 'measurement_key'],
  });
  pgm.addConstraint('diagnostic_measurements', 'diagnostic_measurements_value_check', {
    check: 'value_numeric IS NOT NULL OR value_text IS NOT NULL',
  });
  pgm.addConstraint('diagnostic_measurements', 'diagnostic_measurements_check_scope_fk', {
    foreignKeys: {
      columns: ['workspace_id', 'repair_case_id', 'diagnostic_check_id'],
      references: 'diagnostic_checks(workspace_id, repair_case_id, id)',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('diagnostic_measurements');
  pgm.dropTable('diagnostic_checks');
  pgm.dropConstraint('repair_cases', 'repair_cases_workspace_id_id_unique');
};
