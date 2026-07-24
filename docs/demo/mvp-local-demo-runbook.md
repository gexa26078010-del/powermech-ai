# PowerMech AI Local MVP Demo Runbook

## Purpose

This runbook packages the verified PowerMech AI local backend demo so a founder, operator, or engineer can start it, repeat it, and explain it without reconstructing the implementation history.

The demo follows one controlled chain:

1. A private demo service-center workspace and owner identity.
2. A seeded ATV and repair case.
3. Recorded diagnostic checks and measurements.
4. A controlled Repair Mentor invocation.
5. An AI Gateway boundary using `deterministic_stub`.
6. A local end-to-end verifier covering all five HTTP endpoints.

## What the demo proves

The demo proves that the current local backend can preserve workspace and repair-case context, return structured diagnostic facts, invoke Repair Mentor through the AI Gateway boundary, persist an invocation audit record before returning guidance, and enforce response flags that require human verification.

## What the demo does not prove

It does not prove production readiness, pilot readiness, security hardening, production multi-tenant authorization, model quality, real AI-provider connectivity, knowledge retrieval, document ingestion, user-interface usability, scale, availability, or safety certification.

No real OpenAI or Claude provider is used. Knowledge Service and shared/global knowledge are not implemented.

## Prerequisites

- Windows PowerShell or another terminal
- Node.js 18 or newer
- pnpm 8 or newer
- Docker Desktop with Docker Compose
- Local ports `5432` and `3000` available
- This repository checked out on the intended demo branch

Run all commands from the repository root. The examples use `pnpm.cmd`, which avoids PowerShell command-resolution issues on Windows.

## 1. Install dependencies

```powershell
pnpm.cmd install
```

## 2. Prepare local environment values

The application defaults are documented in `.env.example` and match `docker-compose.yml`:

```text
DB_HOST=localhost
DB_PORT=5432
DB_USER=powermech_dev
DB_PASSWORD=dev_local_only
DB_NAME=powermech_ai_dev
PORT=3000
NODE_ENV=development
```

These credentials are local-development values only. Do not reuse them outside the local demo.

If a local `.env` file is needed:

```powershell
Copy-Item .env.example .env
```

Never commit `.env`.

## 3. Start Docker and PostgreSQL

Start Docker Desktop, then run:

```powershell
docker compose up -d postgres
docker compose ps
```

Continue only when `powermech_ai_postgres` reports healthy. If it does not, inspect:

```powershell
docker compose logs postgres
```

## 4. Apply migrations

```powershell
pnpm.cmd db:migrate
```

The command should complete without a migration error. Re-running it is safe when no new migration is pending.

## 5. Seed the canonical demo data

Run the idempotent seeds in dependency order:

```powershell
pnpm.cmd db:seed:workspace
pnpm.cmd db:seed:demo
pnpm.cmd db:seed:diagnostics
```

The seeds create or update the canonical workspace, owner, vehicle, repair case, and diagnostic context. They do not create production users or customer data.

## 6. Start the API

In a separate terminal at the repository root:

```powershell
pnpm.cmd dev
```

Wait for:

```text
PowerMech AI API listening on http://0.0.0.0:3000
```

Keep this terminal running.

## 7. Run the E2E verifier

In the first terminal:

```powershell
pnpm.cmd verify:demo:e2e
```

Expected result:

```text
PASS GET /health
PASS GET /demo/workspace
PASS GET /demo/repair-case
PASS GET /demo/diagnostic-context
PASS POST /demo/repair-mentor/invoke
PASS demo E2E verification completed (5/5)
```

The POST returns HTTP `201`; the GET endpoints return HTTP `200`. Every successful Repair Mentor invocation adds an audit row.

## Troubleshooting

- `docker` is not recognized: start or install Docker Desktop, then reopen the terminal.
- PostgreSQL is not healthy: run `docker compose logs postgres` and wait for the health check.
- Port `5432` or `3000` is in use: inspect with `Get-NetTCPConnection -LocalPort 5432` or `Get-NetTCPConnection -LocalPort 3000`.
- Migration or seed connection failure: confirm the container is healthy and the database settings match `.env.example`.
- Missing seeded record: rerun the three seed commands in the documented order.
- E2E connection failure: confirm `pnpm.cmd dev` is still running on port `3000`.
- E2E payload failure: do not edit expected values to force a pass. Confirm migrations, seeds, branch, and API logs.
- PowerShell `curl` ambiguity: use `Invoke-RestMethod` or `curl.exe`.

The verifier fails closed at the first incorrect status, invalid JSON body, contract mismatch, missing safety flag, or non-local endpoint.

## Reset the local database

Stop the API, then reset all migrations and apply them again:

```powershell
pnpm.cmd db:reset
pnpm.cmd db:seed:workspace
pnpm.cmd db:seed:demo
pnpm.cmd db:seed:diagnostics
```

`db:reset` deletes the local demo schema data, including invocation audit rows. Use it only against the local development database shown above.

If the local Docker volume itself must be discarded, `docker compose down -v` removes it permanently. This is a stronger local-only reset; verify the Compose project and volume before running it, then start PostgreSQL, migrate, and seed again.

## Readiness statement

A passing local verifier means the canonical backend demo chain works on that machine. It is not a production-readiness or real-pilot-readiness claim.
