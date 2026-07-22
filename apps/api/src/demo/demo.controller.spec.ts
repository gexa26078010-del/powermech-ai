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
});
