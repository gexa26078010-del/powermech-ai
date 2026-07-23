# CI and validation

## Local commands

- `git status`: PASS — expected VS-004-only modified/untracked files on `agent/vs-004-diagnostic-context-recording`.
- `pnpm install`: PASS — already up to date; completed with pnpm 11.9.0.
- `pnpm build`: initial launcher attempt failed because `node` was absent from fallback pnpm's process `PATH`; rerun with the bundled Node path: PASS (`tsc`).
- `pnpm lint`: PASS (`eslint "apps/api/src/**/*.ts"`).
- `pnpm test`: PASS — 2 suites, 7 tests, 0 failures.
- `pnpm repository:validate`: PASS — VS-001 through VS-004 required files/scripts and forbidden-scope checks passed.
- `git diff --check`: PASS.
- Migration, seed, and validator JavaScript syntax checks: PASS.
- Generated node-pg-migrate up SQL inspection: PASS.

## Runtime and remote status

- Database runtime verification: **BLOCKED / NOT EXECUTED** — Docker CLI/service/binaries and `psql` were unavailable; `127.0.0.1:5432` was closed.
- Remote CI: NOT AVAILABLE before a successful push and PR creation.
