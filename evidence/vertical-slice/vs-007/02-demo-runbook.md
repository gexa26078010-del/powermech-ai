# VS-007 Evidence: 02 - Demo Runbook

Primary artifact: `docs/demo/mvp-local-demo-runbook.md`

## Packaged operator sequence

1. Install dependencies.
2. Start the local PostgreSQL container and wait for health.
3. Apply migrations.
4. Seed workspace, repair case, and diagnostics in dependency order.
5. Start the API.
6. Run the local E2E verifier.

## Canonical commands

```powershell
pnpm.cmd install
docker compose up -d postgres
docker compose ps
pnpm.cmd db:migrate
pnpm.cmd db:seed:workspace
pnpm.cmd db:seed:demo
pnpm.cmd db:seed:diagnostics
pnpm.cmd dev
pnpm.cmd verify:demo:e2e
```

The runbook documents expected PASS output, environment values, Windows/Docker/PostgreSQL troubleshooting, and local reset behavior.

## Safety notes

- The verifier uses localhost only.
- The real-provider status is explicitly false.
- Human verification is mandatory.
- Database reset instructions are explicitly local and destructive to local demo data.
- A passing verifier is not a production or pilot-readiness claim.
