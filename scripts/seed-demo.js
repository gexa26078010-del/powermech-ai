#!/usr/bin/env node
const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgres://powermech_dev:dev_local_only@localhost:5432/powermech_ai_dev';
const client = new Client({ connectionString });

async function seed() {
  await client.connect();
  try {
    await client.query('BEGIN');
    await client.query(`INSERT INTO workspaces (id, slug, name, status) VALUES ($1, $2, $3, $4)
      ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, status = EXCLUDED.status, updated_at = now()`,
      ['00000000-0000-4000-8000-000000000001', 'demo-powersport-service', 'Demo Powersport Service', 'active']);
    await client.query(`INSERT INTO identities (id, email, display_name) VALUES ($1, $2, $3)
      ON CONFLICT (email) DO UPDATE SET display_name = EXCLUDED.display_name, updated_at = now()`,
      ['00000000-0000-4000-8000-000000000002', 'owner@demo.powermech.local', 'Demo Owner']);
    await client.query(`INSERT INTO workspace_memberships (id, workspace_id, identity_id, role)
      SELECT $1, w.id, i.id, $2 FROM workspaces w, identities i WHERE w.slug = $3 AND i.email = $4
      ON CONFLICT (workspace_id, identity_id) DO UPDATE SET role = EXCLUDED.role`,
      ['00000000-0000-4000-8000-000000000003', 'owner', 'demo-powersport-service', 'owner@demo.powermech.local']);
    await client.query('COMMIT');
    console.log('Demo workspace seed applied.');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}

seed().catch((error) => { console.error(error.message); process.exit(1); });
