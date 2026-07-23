import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Pool } from 'pg';
import { DATABASE_CONNECTION } from '../db/database.provider';
import { DemoRepairCaseResponse, DemoWorkspaceResponse } from './demo.types';

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
}
