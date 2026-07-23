# Demo seed

- Command: `pnpm db:seed:diagnostics`.
- The seed requires `demo-powersport-service` and `DEMO-RC-0001` with the canonical scenario key.
- It fails clearly if either prerequisite is absent and never creates a workspace or repair case.
- Three checks and two measurements use deterministic UUIDs and scoped `INSERT ... ON CONFLICT` targets.
- JavaScript syntax validation: PASS (`node --check scripts/seed-demo-diagnostics.js`).
- Database runtime verification: **BLOCKED / NOT EXECUTED**. Docker CLI, Docker service/binaries, and `psql` were not available, and `127.0.0.1:5432` was closed.
- Because PostgreSQL was unavailable, migration execution, prerequisite seeds, diagnostic seed execution/repetition, and HTTP verification were not claimed.
