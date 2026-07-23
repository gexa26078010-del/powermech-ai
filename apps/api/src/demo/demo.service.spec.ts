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

  it('maps ordered checks with nested measurements for the demo diagnostic context', async () => {
    const query = jest.fn().mockResolvedValue({
      rows: [
        {
          slug: 'demo-powersport-service',
          case_number: 'DEMO-RC-0001',
          scenario_key: 'starter_cranks_engine_no_start',
          customer_complaint: 'Starter cranks, engine does not start',
          check_key: 'battery_voltage_static',
          title: 'Battery voltage static check',
          status: 'recorded',
          result: 'pass',
          mechanic_note: 'Static battery voltage is within acceptable demo range.',
          measurement_key: 'battery_voltage',
          label: 'Battery voltage',
          value_numeric: 12.6,
          value_text: null,
          unit: 'V',
        },
        {
          slug: 'demo-powersport-service',
          case_number: 'DEMO-RC-0001',
          scenario_key: 'starter_cranks_engine_no_start',
          customer_complaint: 'Starter cranks, engine does not start',
          check_key: 'fuel_pump_prime',
          title: 'Fuel pump prime sound check',
          status: 'recorded',
          result: 'unknown',
          mechanic_note: 'Fuel pump prime sound not confirmed in demo seed.',
          measurement_key: 'fuel_pump_prime_observation',
          label: 'Fuel pump prime observation',
          value_numeric: null,
          value_text: 'Not confirmed',
          unit: null,
        },
        {
          slug: 'demo-powersport-service',
          case_number: 'DEMO-RC-0001',
          scenario_key: 'starter_cranks_engine_no_start',
          customer_complaint: 'Starter cranks, engine does not start',
          check_key: 'spark_presence',
          title: 'Spark presence check',
          status: 'recorded',
          result: 'not_checked',
          mechanic_note: 'Spark presence has not been checked yet in demo seed.',
          measurement_key: null,
          label: null,
          value_numeric: null,
          value_text: null,
          unit: null,
        },
      ],
    });
    const pool = { query } as unknown as Pool;
    await expect(new DemoService(pool).getDiagnosticContext()).resolves.toEqual({
      workspace: { slug: 'demo-powersport-service' },
      repairCase: {
        caseNumber: 'DEMO-RC-0001',
        scenarioKey: 'starter_cranks_engine_no_start',
        customerComplaint: 'Starter cranks, engine does not start',
      },
      diagnosticChecks: [
        {
          checkKey: 'battery_voltage_static',
          title: 'Battery voltage static check',
          status: 'recorded',
          result: 'pass',
          mechanicNote: 'Static battery voltage is within acceptable demo range.',
          measurements: [{
            measurementKey: 'battery_voltage',
            label: 'Battery voltage',
            valueNumeric: 12.6,
            valueText: null,
            unit: 'V',
          }],
        },
        {
          checkKey: 'fuel_pump_prime',
          title: 'Fuel pump prime sound check',
          status: 'recorded',
          result: 'unknown',
          mechanicNote: 'Fuel pump prime sound not confirmed in demo seed.',
          measurements: [{
            measurementKey: 'fuel_pump_prime_observation',
            label: 'Fuel pump prime observation',
            valueNumeric: null,
            valueText: 'Not confirmed',
            unit: null,
          }],
        },
        {
          checkKey: 'spark_presence',
          title: 'Spark presence check',
          status: 'recorded',
          result: 'not_checked',
          mechanicNote: 'Spark presence has not been checked yet in demo seed.',
          measurements: [],
        },
      ],
      boundaries: {
        workspaceScoped: true,
        repairCaseScoped: true,
        aiImplemented: false,
        repairMentorImplemented: false,
        sharedKnowledgeImplemented: false,
        globalKnowledgeImplemented: false,
      },
    });
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('ORDER BY dc.check_key ASC, dm.measurement_key ASC NULLS LAST'),
      ['demo-powersport-service', 'DEMO-RC-0001', 'starter_cranks_engine_no_start'],
    );
  });
});
