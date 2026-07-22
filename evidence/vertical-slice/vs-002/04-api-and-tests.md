# API and tests

- Endpoint: `GET /demo/workspace`.
- `DemoModule` is under `apps/api/src/demo/` and imported by `AppModule`.
- Service tests cover row mapping and missing-seed behavior.
- Controller test covers the required response shape.
- No authentication is required or implemented.
- `pnpm test`: PASS — 2 suites, 3 tests, 0 failures.
