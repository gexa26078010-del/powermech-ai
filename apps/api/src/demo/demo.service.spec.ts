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
});
