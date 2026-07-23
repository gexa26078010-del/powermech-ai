exports.up = (pgm) => {
  pgm.createTable('vehicles', {
    id: { type: 'uuid', primaryKey: true },
    workspace_id: { type: 'uuid', notNull: true, references: 'workspaces' },
    brand: { type: 'text', notNull: true },
    model: { type: 'text', notNull: true },
    model_year: { type: 'integer', notNull: true },
    vehicle_family: { type: 'text', notNull: true },
    vin: { type: 'text' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
  pgm.addConstraint('vehicles', 'vehicles_model_year_check', { check: 'model_year BETWEEN 1886 AND 2200' });
  pgm.addConstraint('vehicles', 'vehicles_workspace_id_id_unique', { unique: ['workspace_id', 'id'] });
  pgm.createIndex('vehicles', ['workspace_id', 'vin'], {
    name: 'vehicles_workspace_vin_unique',
    unique: true,
    where: 'vin IS NOT NULL',
  });

  pgm.createTable('repair_cases', {
    id: { type: 'uuid', primaryKey: true },
    workspace_id: { type: 'uuid', notNull: true, references: 'workspaces' },
    vehicle_id: { type: 'uuid', notNull: true, references: 'vehicles' },
    case_number: { type: 'text', notNull: true },
    customer_complaint: { type: 'text', notNull: true },
    status: { type: 'text', notNull: true, default: 'open' },
    scenario_key: { type: 'text', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
  pgm.addConstraint('repair_cases', 'repair_cases_workspace_case_number_unique', { unique: ['workspace_id', 'case_number'] });
  pgm.addConstraint('repair_cases', 'repair_cases_status_check', { check: "status = 'open'" });
  pgm.addConstraint('repair_cases', 'repair_cases_workspace_vehicle_fk', {
    foreignKeys: {
      columns: ['workspace_id', 'vehicle_id'],
      references: 'vehicles(workspace_id, id)',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('repair_cases');
  pgm.dropTable('vehicles');
};
