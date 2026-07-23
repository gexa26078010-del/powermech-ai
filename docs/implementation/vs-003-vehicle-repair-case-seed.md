# VS-003 — Vehicle / Repair Case Seed

VS-003 adds one workspace-scoped demo vehicle and one workspace-scoped demo repair case for the first MVP scenario. The `vehicles` and `repair_cases` tables both require `workspace_id`, and a composite foreign key prevents a repair case from referencing a vehicle in another workspace.

Run `pnpm db:migrate`, then `pnpm db:seed:demo` against a database where the VS-002 demo workspace has already been seeded. The VS-003 command requires that workspace to exist and never creates a workspace itself. For a separate clean VS-002 bootstrap, `pnpm db:seed:workspace` retains the original workspace/identity seed. Both vehicle and repair-case writes use workspace-scoped conflict targets, so repeated VS-003 runs do not duplicate them.

`GET /demo/repair-case` returns the canonical demo workspace, vehicle, repair case, and explicit boundary flags. Existing `GET /health` and `GET /demo/workspace` behavior is preserved.

This slice does not implement diagnostics, measurements, repair steps, Repair Mentor, AI, shared/global knowledge, authentication, parts, inventory, work orders, or frontend functionality. Final GO remains pending review and VS-004 remains locked.
