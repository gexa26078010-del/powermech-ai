# Endpoints and E2E verification

- Script: `scripts/verify-demo-e2e.js`.
- Command: `pnpm verify:demo:e2e`.
- Endpoints: `/health`, `/demo/workspace`, `/demo/repair-case`, `/demo/diagnostic-context`, and `POST /demo/repair-mentor/invoke`.
- The verifier is sequential, fail-fast, native-fetch-only, local-only, rejects redirects, requires exact HTTP `200`/`201`, and exits non-zero on an invalid status, JSON response, identifier, check key, safety flag, or boundary flag.
- A successful POST indirectly verifies audit persistence because the AI Gateway writes the audit row before responding; the verifier does not query the audit table directly.

## Runtime result

Status: **NOT EXECUTED / BLOCKED**

- The API was not started because Docker/PostgreSQL are unavailable.
- `pnpm verify:demo:e2e` was not executed after the required runtime stop condition.
- Runtime behavior of all five endpoints is not verified in this environment.
- Controlled Repair Mentor invocation and audit persistence are not runtime-verified.
- Existing endpoint contracts remain statically preserved; no product source file was changed.
