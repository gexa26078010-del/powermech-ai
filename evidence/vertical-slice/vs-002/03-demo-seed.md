# Demo seed

- Command: `pnpm db:seed:demo`.
- Values match the required demo workspace and owner.
- Fixed UUIDs plus `INSERT ... ON CONFLICT` make repeated runs idempotent.
- DB runtime verification: **BLOCKED / NOT EXECUTED**.
- Docker CLI/service and `psql` were not available; `localhost:5432` was closed.
- Consequently migration, two-run seed idempotency, live API startup, and curl verification were not executed locally.
