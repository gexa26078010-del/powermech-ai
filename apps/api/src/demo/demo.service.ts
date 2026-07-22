import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Pool } from 'pg';
import { DATABASE_CONNECTION } from '../db/database.provider';
import { DemoWorkspaceResponse } from './demo.types';

interface DemoWorkspaceRow {
  slug: string;
  name: string;
  status: string;
  email: string;
  display_name: string;
  role: string;
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
}
