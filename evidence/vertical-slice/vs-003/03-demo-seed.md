# Demo seed

- `pnpm db:seed:demo` runs only the strict VS-003 vehicle/repair-case seed.
- The seed looks up `demo-powersport-service`, fails clearly if it is absent, and never creates a workspace.
- `pnpm db:seed:workspace` separately preserves the original VS-002 bootstrap for clean environments; it is not implicitly run by the VS-003 seed.
- Vehicle conflict identity: `(workspace_id, vin)`.
- Repair-case conflict identity: `(workspace_id, case_number)`.
- Deterministic UUIDs and `INSERT ... ON CONFLICT` make repeated runs idempotent.
- Static script syntax: PASS.
- DB runtime verification: **BLOCKED / NOT EXECUTED**.
- Docker CLI/service and `psql` were unavailable; `localhost:5432` was closed.
- Consequently missing-workspace runtime failure and two-run seed idempotency were not executed against PostgreSQL.
