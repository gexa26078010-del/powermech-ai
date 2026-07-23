# API and tests

- Endpoint: `GET /demo/repair-case`.
- The existing DemoModule is extended; no unrelated module is introduced.
- Service tests cover response mapping, workspace-scoped query parameters, and boundary flags.
- Controller tests cover the required response shape and GET route metadata.
- Existing `/health` and `/demo/workspace` implementations remain unchanged except for the minimal DemoController extension.
- `pnpm test`: PASS — 2 suites, 5 tests, 0 failures.
- Live endpoint verification is blocked by unavailable PostgreSQL runtime and is recorded in `05-ci-and-validation.md`.
