#!/usr/bin/env node
const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgres://powermech_dev:dev_local_only@localhost:5432/powermech_ai_dev';
const client = new Client({ connectionString });

async function upsertCheck(workspaceId, repairCaseId, check) {
  const result = await client.query(
    `INSERT INTO diagnostic_checks
       (id, workspace_id, repair_case_id, check_key, title, status, result, mechanic_note)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (workspace_id, repair_case_id, check_key)
     DO UPDATE SET title = EXCLUDED.title, status = EXCLUDED.status,
       result = EXCLUDED.result, mechanic_note = EXCLUDED.mechanic_note, updated_at = now()
     RETURNING id`,
    [check.id, workspaceId, repairCaseId, check.checkKey, check.title, 'recorded', check.result, check.mechanicNote],
  );
  return result.rows[0].id;
}

async function upsertMeasurement(workspaceId, repairCaseId, diagnosticCheckId, measurement) {
  await client.query(
    `INSERT INTO diagnostic_measurements
       (id, workspace_id, repair_case_id, diagnostic_check_id, measurement_key,
        label, value_numeric, value_text, unit)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT (workspace_id, repair_case_id, diagnostic_check_id, measurement_key)
     DO UPDATE SET label = EXCLUDED.label, value_numeric = EXCLUDED.value_numeric,
       value_text = EXCLUDED.value_text, unit = EXCLUDED.unit`,
    [
      measurement.id,
      workspaceId,
      repairCaseId,
      diagnosticCheckId,
      measurement.measurementKey,
      measurement.label,
      measurement.valueNumeric,
      measurement.valueText,
      measurement.unit,
    ],
  );
}

async function seedDiagnostics() {
  await client.connect();
  try {
    await client.query('BEGIN');
    const workspaceResult = await client.query(
      'SELECT id FROM workspaces WHERE slug = $1',
      ['demo-powersport-service'],
    );
    const workspace = workspaceResult.rows[0];
    if (!workspace) {
      throw new Error('Demo workspace demo-powersport-service does not exist; apply the VS-002 seed first.');
    }

    const repairCaseResult = await client.query(
      `SELECT id FROM repair_cases
       WHERE workspace_id = $1 AND case_number = $2 AND scenario_key = $3`,
      [workspace.id, 'DEMO-RC-0001', 'starter_cranks_engine_no_start'],
    );
    const repairCase = repairCaseResult.rows[0];
    if (!repairCase) {
      throw new Error('Demo repair case DEMO-RC-0001 does not exist in demo-powersport-service; apply the VS-003 seed first.');
    }

    const checks = [
      {
        id: '00000000-0000-4000-8000-000000000006',
        checkKey: 'battery_voltage_static',
        title: 'Battery voltage static check',
        result: 'pass',
        mechanicNote: 'Static battery voltage is within acceptable demo range.',
        measurement: {
          id: '00000000-0000-4000-8000-000000000009',
          measurementKey: 'battery_voltage',
          label: 'Battery voltage',
          valueNumeric: 12.6,
          valueText: null,
          unit: 'V',
        },
      },
      {
        id: '00000000-0000-4000-8000-000000000007',
        checkKey: 'fuel_pump_prime',
        title: 'Fuel pump prime sound check',
        result: 'unknown',
        mechanicNote: 'Fuel pump prime sound not confirmed in demo seed.',
        measurement: {
          id: '00000000-0000-4000-8000-000000000010',
          measurementKey: 'fuel_pump_prime_observation',
          label: 'Fuel pump prime observation',
          valueNumeric: null,
          valueText: 'Not confirmed',
          unit: null,
        },
      },
      {
        id: '00000000-0000-4000-8000-000000000008',
        checkKey: 'spark_presence',
        title: 'Spark presence check',
        result: 'not_checked',
        mechanicNote: 'Spark presence has not been checked yet in demo seed.',
        measurement: null,
      },
    ];

    for (const check of checks) {
      const diagnosticCheckId = await upsertCheck(workspace.id, repairCase.id, check);
      if (check.measurement) {
        await upsertMeasurement(workspace.id, repairCase.id, diagnosticCheckId, check.measurement);
      }
    }
    await client.query('COMMIT');
    console.log('Demo diagnostic context seed applied.');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}

seedDiagnostics().catch((error) => { console.error(error.message); process.exit(1); });
