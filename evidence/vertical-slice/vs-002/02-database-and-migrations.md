# Database and migrations

- Migration: `1700000000000_create_workspace_identity_boundary.js`.
- Tables: `workspaces`, `identities`, `workspace_memberships`.
- Memberships reference both parent tables and enforce uniqueness on `(workspace_id, identity_id)`.
- Runtime API reuses the existing `DATABASE_CONNECTION` injection token; no second API pool or ORM was added.
