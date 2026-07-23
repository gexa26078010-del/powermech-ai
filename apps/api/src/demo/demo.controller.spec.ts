import { RequestMethod } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { DemoController } from './demo.controller';
import { DemoService } from './demo.service';

describe('DemoController', () => {
  it('returns the demo service response shape', async () => {
    const response = {
      workspace: { slug: 'demo-powersport-service', name: 'Demo Powersport Service', status: 'active' },
      owner: { email: 'owner@demo.powermech.local', displayName: 'Demo Owner' },
      membership: { role: 'owner' },
      boundaries: { privateWorkspace: true as const, sharedKnowledgeImplemented: false as const, globalKnowledgeImplemented: false as const },
    };
    const service = { getWorkspace: jest.fn().mockResolvedValue(response) } as unknown as DemoService;
    await expect(new DemoController(service).getWorkspace()).resolves.toEqual(response);
    expect(Reflect.getMetadata(PATH_METADATA, DemoController)).toBe('demo');
    expect(Reflect.getMetadata(PATH_METADATA, DemoController.prototype.getWorkspace)).toBe('workspace');
    expect(Reflect.getMetadata(METHOD_METADATA, DemoController.prototype.getWorkspace)).toBe(RequestMethod.GET);
  });

  it('returns the workspace-scoped repair-case response shape', async () => {
    const response = {
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
        workspaceScoped: true as const,
        diagnosticsImplemented: false as const,
        repairMentorImplemented: false as const,
        sharedKnowledgeImplemented: false as const,
        globalKnowledgeImplemented: false as const,
      },
    };
    const service = { getRepairCase: jest.fn().mockResolvedValue(response) } as unknown as DemoService;
    await expect(new DemoController(service).getRepairCase()).resolves.toEqual(response);
    expect(Reflect.getMetadata(PATH_METADATA, DemoController.prototype.getRepairCase)).toBe('repair-case');
    expect(Reflect.getMetadata(METHOD_METADATA, DemoController.prototype.getRepairCase)).toBe(RequestMethod.GET);
  });

  it('returns the workspace-scoped diagnostic-context response shape', async () => {
    const response = {
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
      ],
      boundaries: {
        workspaceScoped: true as const,
        repairCaseScoped: true as const,
        aiImplemented: false as const,
        repairMentorImplemented: false as const,
        sharedKnowledgeImplemented: false as const,
        globalKnowledgeImplemented: false as const,
      },
    };
    const service = { getDiagnosticContext: jest.fn().mockResolvedValue(response) } as unknown as DemoService;
    await expect(new DemoController(service).getDiagnosticContext()).resolves.toEqual(response);
    expect(Reflect.getMetadata(PATH_METADATA, DemoController.prototype.getDiagnosticContext)).toBe('diagnostic-context');
    expect(Reflect.getMetadata(METHOD_METADATA, DemoController.prototype.getDiagnosticContext)).toBe(RequestMethod.GET);
  });
});
