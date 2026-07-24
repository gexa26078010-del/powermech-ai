# VS-008 Evidence: 05 - CI and Runtime

## Required commands

```powershell
pnpm.cmd install
pnpm.cmd build
pnpm.cmd lint
pnpm.cmd test
pnpm.cmd repository:validate
```

## Local static results

Executed on 2026-07-24:

- `pnpm.cmd install`: PASS - already up to date; completed in 3s with pnpm 11.15.1.
- `pnpm.cmd build`: PASS - TypeScript compiler exited 0.
- `pnpm.cmd lint`: PASS - ESLint exited 0 with no findings.
- `pnpm.cmd test`: PASS - 9/9 suites and 35/35 tests passed; 0 snapshots.
- `pnpm.cmd repository:validate`: PASS - VS-001 through VS-008 validation completed with zero failures.

## Deterministic local E2E

Status: PASS

PostgreSQL was running and healthy. The VS-008 provider-key constraint migration applied successfully. The API was started with `AI_PROVIDER=deterministic_stub`, and the unchanged verifier returned:

- `PASS GET /health`
- `PASS GET /demo/workspace`
- `PASS GET /demo/repair-case`
- `PASS GET /demo/diagnostic-context`
- `PASS POST /demo/repair-mentor/invoke`
- `PASS demo E2E verification completed (5/5)`

The temporary API process was stopped after verification. No `OPENAI_API_KEY` was required or used.

## Migration command note

`pnpm.cmd db:migrate` failed before migration execution because the repository's pre-existing package script passes the URL to `node-pg-migrate -d`, while the installed CLI treats `-d` as an environment-variable name. The exact error was `client password must be a string`.

VS-008 used the supported direct CLI path with `DATABASE_URL`; migration `1740000000000_allow_controlled_ai_provider_keys` then completed successfully. Package tooling was not changed because it is outside the controlled provider-adapter scope.

## Real provider runtime

Status: NOT RUN

No real-provider call is authorized by automated verification. A live call requires an already available key and explicit user approval.

## CI

Status: NOT YET AVAILABLE

No CI success is claimed before the pushed branch or PR checks are observed.
