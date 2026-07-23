# VS-002 — Demo Workspace & Identity Seed

VS-002 establishes the private service-workspace boundary with three PostgreSQL tables: `workspaces`, `identities`, and `workspace_memberships`. The membership foreign keys and unique workspace/identity pair make ownership explicit without adding authentication.

Run `pnpm db:migrate`, then `pnpm db:seed:workspace`. The workspace seed uses deterministic UUIDs and conflict handling, so repeated runs update the same demo workspace, owner, and membership rather than duplicating them. From VS-003 onward, `pnpm db:seed:demo` is the strict vehicle/repair-case seed and requires this workspace to exist.

`GET /demo/workspace` reads the seeded owner membership through the existing `DATABASE_CONNECTION` provider. It requires the migration and seed but intentionally requires no authentication.

This slice does not implement shared or global knowledge, authentication, vehicles, repair cases, AI, embeddings, vector search, or frontend functionality. Final GO remains pending review and VS-003 remains locked.
