# API and tests

- Endpoint: `GET /demo/diagnostic-context`.
- Existing DemoModule is extended; no unrelated module is introduced.
- Service tests cover response mapping, deterministic SQL ordering, nested measurements, and boundary flags.
- Controller tests cover response shape and GET route metadata.
- Existing `/health`, `/demo/workspace`, and `/demo/repair-case` implementations remain available.
- `pnpm build`: PASS after exposing the bundled Node runtime in the process `PATH`; the first launcher attempt did not reach TypeScript because fallback pnpm could not resolve `node`.
- `pnpm lint`: PASS.
- `pnpm test`: PASS — 2 suites, 7 tests, 0 failures.
- Live HTTP verification: **BLOCKED / NOT EXECUTED** because PostgreSQL/Docker was unavailable.
