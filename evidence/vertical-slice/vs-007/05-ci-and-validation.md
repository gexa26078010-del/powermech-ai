# VS-007 Evidence: 05 - CI and Validation

## Required local commands

The following commands must pass before commit:

```powershell
pnpm.cmd install
pnpm.cmd build
pnpm.cmd lint
pnpm.cmd test
pnpm.cmd repository:validate
```

## VS-007 repository validation coverage

The validator preserves VS-001 through VS-006 checks and adds presence checks for:

- Five files under `docs/demo/`
- Six files under `evidence/vertical-slice/vs-007/`

It also requires the non-canonical path `evidence/vs-007` to be absent.

## Local results

Executed on 2026-07-24:

- `pnpm.cmd install`: PASS - already up to date; completed in 1.9s with pnpm 11.15.1.
- `pnpm.cmd build`: PASS - TypeScript compiler exited 0.
- `pnpm.cmd lint`: PASS - ESLint exited 0 with no findings.
- `pnpm.cmd test`: PASS - 6/6 suites and 16/16 tests passed; 0 snapshots.
- `pnpm.cmd repository:validate`: PASS - VS-001 through VS-007 repository validation completed with zero failures.

## Runtime verification

Status: NOT RUN

The existing PostgreSQL container was running and healthy, but TCP port `3000` was not listening. Because the API runtime was not already available and E2E execution is optional for this documentation-only slice, `pnpm.cmd verify:demo:e2e` was not run.

This is not an E2E failure and does not replace the live local verification recorded and granted in VS-006.

## CI result

Status: NOT YET AVAILABLE

No CI success is claimed before a remote branch/PR check is observed.
