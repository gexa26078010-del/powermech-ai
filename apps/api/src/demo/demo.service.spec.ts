import { NotFoundException } from '@nestjs/common';
import { Pool } from 'pg';
import { DemoService } from './demo.service';

describe('DemoService', () => {
  it('maps the seeded workspace boundary response', async () => {
    const query = jest.fn().mockResolvedValue({ rows: [{ slug: 'demo-powersport-service', name: 'Demo Powersport Service', status: 'active', email: 'owner@demo.powermech.local', display_name: 'Demo Owner', role: 'owner' }] });
    const pool = { query } as unknown as Pool;
    await expect(new DemoService(pool).getWorkspace()).resolves.toEqual({
      workspace: { slug: 'demo-powersport-service', name: 'Demo Powersport Service', status: 'active' },
      owner: { email: 'owner@demo.powermech.local', displayName: 'Demo Owner' },
      membership: { role: 'owner' },
      boundaries: { privateWorkspace: true, sharedKnowledgeImplemented: false, globalKnowledgeImplemented: false },
    });
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('WHERE w.slug = $1 AND i.email = $2 AND wm.role = $3'),
      ['demo-powersport-service', 'owner@demo.powermech.local', 'owner'],
    );
  });

  it('reports a missing seed', async () => {
    const pool = { query: jest.fn().mockResolvedValue({ rows: [] }) } as unknown as Pool;
    await expect(new DemoService(pool).getWorkspace()).rejects.toBeInstanceOf(NotFoundException);
  });

  it('maps the workspace-scoped demo repair case', async () => {
    const query = jest.fn().mockResolvedValue({
      rows: [{
        slug: 'demo-powersport-service',
        name: 'Demo Powersport Service',
        brand: 'Demo Powersport',
        model: 'Demo 1000 ATV',
        model_year: 2024,
        vehicle_family: '1000cc_atv_model_family',
        vin: 'DEMOATV1000000001',
        case_number: 'DEMO-RC-0001',
        customer_complaint: 'Starter cranks, engine does not start',
        status: 'open',
        scenario_key: 'starter_cranks_engine_no_start',
      }],
    });
    const pool = { query } as unknown as Pool;
    await expect(new DemoService(pool).getRepairCase()).resolves.toEqual({
      workspace: { slug: 'demo-powersport-service', name: 'Demo Powersport Service' },
      vehicle: {
        brand: 'Demo Powersport',
        model: 'Demo 1000 ATV',
        modelYear: 2024,
        vehicleFamily: '1000cc_atv_model_family',
        vin: 'DEMOATV1000000001',
      },
      repairCase: {
        caseNumber: 'DEMO-RC-0001',
        customerComplaint: 'Starter cranks, engine does not start',
        status: 'open',
        scenarioKey: 'starter_cranks_engine_no_start',
      },
      boundaries: {
        workspaceScoped: true,
        diagnosticsImplemented: false,
        repairMentorImplemented: false,
        sharedKnowledgeImplemented: false,
        globalKnowledgeImplemented: false,
      },
    });
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('rc.workspace_id = w.id AND rc.vehicle_id = v.id'),
      ['demo-powersport-service', 'DEMOATV1000000001', 'DEMO-RC-0001'],
    );
  });
});
