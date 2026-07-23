#!/usr/bin/env node
const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgres://powermech_dev:dev_local_only@localhost:5432/powermech_ai_dev';
const client = new Client({ connectionString });

async function seedRepairCase() {
  await client.connect();
  try {
    await client.query('BEGIN');
    const workspaceResult = await client.query(
      'SELECT id FROM workspaces WHERE slug = $1',
      ['demo-powersport-service'],
    );
    const workspace = workspaceResult.rows[0];
    if (!workspace) {
      throw new Error('Demo workspace demo-powersport-service does not exist; apply the VS-002 demo seed first.');
    }

    const vehicleResult = await client.query(
      `INSERT INTO vehicles (id, workspace_id, brand, model, model_year, vehicle_family, vin)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (workspace_id, vin) WHERE vin IS NOT NULL
       DO UPDATE SET brand = EXCLUDED.brand, model = EXCLUDED.model,
         model_year = EXCLUDED.model_year, vehicle_family = EXCLUDED.vehicle_family,
         updated_at = now()
       RETURNING id`,
      [
        '00000000-0000-4000-8000-000000000004',
        workspace.id,
        'Demo Powersport',
        'Demo 1000 ATV',
        2024,
        '1000cc_atv_model_family',
        'DEMOATV1000000001',
      ],
    );
    const vehicle = vehicleResult.rows[0];

    await client.query(
      `INSERT INTO repair_cases
         (id, workspace_id, vehicle_id, case_number, customer_complaint, status, scenario_key)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (workspace_id, case_number)
       DO UPDATE SET vehicle_id = EXCLUDED.vehicle_id,
         customer_complaint = EXCLUDED.customer_complaint, status = EXCLUDED.status,
         scenario_key = EXCLUDED.scenario_key, updated_at = now()`,
      [
        '00000000-0000-4000-8000-000000000005',
        workspace.id,
        vehicle.id,
        'DEMO-RC-0001',
        'Starter cranks, engine does not start',
        'open',
        'starter_cranks_engine_no_start',
      ],
    );
    await client.query('COMMIT');
    console.log('Demo vehicle and repair-case seed applied.');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}

seedRepairCase().catch((error) => { console.error(error.message); process.exit(1); });
