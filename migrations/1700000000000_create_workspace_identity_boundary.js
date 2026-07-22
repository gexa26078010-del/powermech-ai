exports.up = (pgm) => {
  pgm.createTable('workspaces', {
    id: { type: 'uuid', primaryKey: true },
    slug: { type: 'text', notNull: true, unique: true },
    name: { type: 'text', notNull: true },
    status: { type: 'text', notNull: true, default: 'active' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
  pgm.createTable('identities', {
    id: { type: 'uuid', primaryKey: true },
    email: { type: 'text', notNull: true, unique: true },
    display_name: { type: 'text', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
  pgm.createTable('workspace_memberships', {
    id: { type: 'uuid', primaryKey: true },
    workspace_id: { type: 'uuid', notNull: true, references: 'workspaces', onDelete: 'CASCADE' },
    identity_id: { type: 'uuid', notNull: true, references: 'identities', onDelete: 'CASCADE' },
    role: { type: 'text', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
  pgm.addConstraint('workspace_memberships', 'workspace_memberships_workspace_identity_unique', { unique: ['workspace_id', 'identity_id'] });
};

exports.down = (pgm) => {
  pgm.dropTable('workspace_memberships');
  pgm.dropTable('identities');
  pgm.dropTable('workspaces');
};
