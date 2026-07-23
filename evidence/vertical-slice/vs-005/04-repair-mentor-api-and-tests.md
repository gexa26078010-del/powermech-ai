# Repair Mentor API and tests

- Endpoint: `POST /demo/repair-mentor/invoke`.
- No request body is required.
- The endpoint uses workspace-scoped diagnostic context and persists an invocation audit row before returning guidance.
- Guidance is limited to confirming fuel-pump prime and checking spark presence.
- Human verification is required; final diagnosis and repair approval flags are false.
- Existing `/health`, `/demo/workspace`, `/demo/repair-case`, and `/demo/diagnostic-context` implementations remain available.
- `pnpm build`: PASS (`tsc`).
- `pnpm lint`: PASS (`eslint "apps/api/src/**/*.ts"`).
- `pnpm test`: PASS — 6 suites, 16 tests, 0 failures.
- Tests cover the POST route, exact response, fail-closed provider contract, audit success/failure, log failure, and all existing endpoint route contracts.
- Live HTTP verification: **BLOCKED / NOT EXECUTED** because Docker/PostgreSQL was unavailable.
