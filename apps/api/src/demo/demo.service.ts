import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Pool } from 'pg';
import { DATABASE_CONNECTION } from '../db/database.provider';
import {
  DemoDiagnosticCheckResponse,
  DemoDiagnosticContextResponse,
  DemoRepairCaseResponse,
  DemoWorkspaceResponse,
} from './demo.types';

interface DemoWorkspaceRow {
  slug: string;
  name: string;
  status: string;
  email: string;
  display_name: string;
  role: string;
}

interface DemoRepairCaseRow {
  slug: string;
  name: string;
  brand: string;
  model: string;
  model_year: number;
  vehicle_family: string;
  vin: string;
  case_number: string;
  customer_complaint: string;
  status: string;
  scenario_key: string;
}

interface DemoDiagnosticContextRow {
  slug: string;
  case_number: string;
  scenario_key: string;
  customer_complaint: string;
  check_key: string;
  title: string;
  status: string;
  result: string;
  mechanic_note: string | null;
  measurement_key: string | null;
  label: string | null;
  value_numeric: number | null;
  value_text: string | null;
  unit: string | null;
}

@Injectable()
export class DemoService {
  constructor(@Inject(DATABASE_CONNECTION) private readonly pool: Pool) {}

  async getWorkspace(): Promise<DemoWorkspaceResponse> {
    const result = await this.pool.query<DemoWorkspaceRow>(
      `SELECT w.slug, w.name, w.status, i.email, i.display_name, wm.role
       FROM workspaces w
       JOIN workspace_memberships wm ON wm.workspace_id = w.id
       JOIN identities i ON i.id = wm.identity_id
       WHERE w.slug = $1 AND i.email = $2 AND wm.role = $3
       LIMIT 1`,
      ['demo-powersport-service', 'owner@demo.powermech.local', 'owner'],
    );
    const row = result.rows[0];
    if (!row) throw new NotFoundException('Demo workspace seed not found');
    return {
      workspace: { slug: row.slug, name: row.name, status: row.status },
      owner: { email: row.email, displayName: row.display_name },
      membership: { role: row.role },
      boundaries: {
        privateWorkspace: true,
        sharedKnowledgeImplemented: false,
        globalKnowledgeImplemented: false,
      },
    };
  }

  async getRepairCase(): Promise<DemoRepairCaseResponse> {
    const result = await this.pool.query<DemoRepairCaseRow>(
      `SELECT w.slug, w.name, v.brand, v.model, v.model_year, v.vehicle_family, v.vin,
         rc.case_number, rc.customer_complaint, rc.status, rc.scenario_key
       FROM workspaces w
       JOIN vehicles v ON v.workspace_id = w.id
       JOIN repair_cases rc ON rc.workspace_id = w.id AND rc.vehicle_id = v.id
       WHERE w.slug = $1 AND v.vin = $2 AND rc.case_number = $3
       LIMIT 1`,
      ['demo-powersport-service', 'DEMOATV1000000001', 'DEMO-RC-0001'],
    );
    const row = result.rows[0];
    if (!row) throw new NotFoundException('Demo repair-case seed not found');
    return {
      workspace: { slug: row.slug, name: row.name },
      vehicle: {
        brand: row.brand,
        model: row.model,
        modelYear: row.model_year,
        vehicleFamily: row.vehicle_family,
        vin: row.vin,
      },
      repairCase: {
        caseNumber: row.case_number,
        customerComplaint: row.customer_complaint,
        status: row.status,
        scenarioKey: row.scenario_key,
      },
      boundaries: {
        workspaceScoped: true,
        diagnosticsImplemented: false,
        repairMentorImplemented: false,
        sharedKnowledgeImplemented: false,
        globalKnowledgeImplemented: false,
      },
    };
  }

  async getDiagnosticContext(): Promise<DemoDiagnosticContextResponse> {
    const result = await this.pool.query<DemoDiagnosticContextRow>(
      `SELECT w.slug, rc.case_number, rc.scenario_key, rc.customer_complaint,
         dc.check_key, dc.title, dc.status, dc.result, dc.mechanic_note,
         dm.measurement_key, dm.label, dm.value_numeric::double precision AS value_numeric,
         dm.value_text, dm.unit
       FROM workspaces w
       JOIN repair_cases rc ON rc.workspace_id = w.id
       JOIN diagnostic_checks dc ON dc.workspace_id = w.id AND dc.repair_case_id = rc.id
       LEFT JOIN diagnostic_measurements dm ON dm.workspace_id = w.id
         AND dm.repair_case_id = rc.id AND dm.diagnostic_check_id = dc.id
       WHERE w.slug = $1 AND rc.case_number = $2 AND rc.scenario_key = $3
       ORDER BY dc.check_key ASC, dm.measurement_key ASC NULLS LAST`,
      ['demo-powersport-service', 'DEMO-RC-0001', 'starter_cranks_engine_no_start'],
    );
    const firstRow = result.rows[0];
    if (!firstRow) throw new NotFoundException('Demo diagnostic-context seed not found');

    const checksByKey = new Map<string, DemoDiagnosticCheckResponse>();
    for (const row of result.rows) {
      let check = checksByKey.get(row.check_key);
      if (!check) {
        check = {
          checkKey: row.check_key,
          title: row.title,
          status: row.status,
          result: row.result,
          mechanicNote: row.mechanic_note,
          measurements: [],
        };
        checksByKey.set(row.check_key, check);
      }
      if (row.measurement_key !== null && row.label !== null) {
        check.measurements.push({
          measurementKey: row.measurement_key,
          label: row.label,
          valueNumeric: row.value_numeric,
          valueText: row.value_text,
          unit: row.unit,
        });
      }
    }

    return {
      workspace: { slug: firstRow.slug },
      repairCase: {
        caseNumber: firstRow.case_number,
        scenarioKey: firstRow.scenario_key,
        customerComplaint: firstRow.customer_complaint,
      },
      diagnosticChecks: [...checksByKey.values()],
      boundaries: {
        workspaceScoped: true,
        repairCaseScoped: true,
        aiImplemented: false,
        repairMentorImplemented: false,
        sharedKnowledgeImplemented: false,
        globalKnowledgeImplemented: false,
      },
    };
  }
}
