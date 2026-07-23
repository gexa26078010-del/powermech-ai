# CI and validation

## Static checks

- `pnpm install`: PASS (exit `0`); lockfile was already current, `Done in 7.7s using pnpm v11.9.0`.
- `pnpm build`: PASS (exit `0`); TypeScript compilation completed.
- `pnpm lint`: PASS (exit `0`); ESLint completed with no errors.
- `pnpm test`: PASS (exit `0`); 6 suites and 16 tests passed, 0 snapshots. Jest reported a worker forced-exit warning after the passing run.
- `pnpm repository:validate`: PASS (exit `0`); VS-001 through VS-006 repository validation completed with `Validation result: PASS`.
- `node --check scripts/verify-demo-e2e.js`: PASS (exit `0`).
- `node --check scripts/validate-repository.js`: PASS (exit `0`).
- `git diff --check`: PASS (exit `0`).

## Runtime and remote checks

- Runtime verification: **BLOCKED** because Docker and `psql` are unavailable and no PostgreSQL listener is present on port `5432`.
- Migrations, seeds, API startup, endpoint checks, and `pnpm verify:demo:e2e`: NOT EXECUTED.
- Remote CI: NOT AVAILABLE before push/PR.
