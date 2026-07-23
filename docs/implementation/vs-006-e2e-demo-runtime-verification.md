# VS-006 — E2E Demo Runtime Verification

## 1. Purpose

VS-006 verifies the existing local demo chain end to end: workspace and identity, vehicle and repair case, diagnostic context, controlled Repair Mentor invocation, and AI Gateway audit logging. It adds no product feature and does not claim production readiness.

## 2. Prerequisites

- Node.js 18 or newer
- pnpm 8 or newer
- Docker Desktop with Docker Compose
- Local ports `5432` and `3000` available
- Repository checked out on the intended verification branch

Run `pnpm install` before the remaining commands.

## 3. Environment variables

The defaults match `docker-compose.yml` and `.env.example`:

```text
DB_HOST=localhost
DB_PORT=5432
DB_USER=powermech_dev
DB_PASSWORD=dev_local_only
DB_NAME=powermech_ai_dev
PORT=3000
NODE_ENV=development
```

These are local development credentials only. The verifier requires no OpenAI, Claude, or other external-provider key.

## 4. Docker/PostgreSQL startup

```powershell
docker compose up -d postgres
docker compose ps
docker compose logs postgres
```

Wait until the PostgreSQL container reports healthy before migrations.

## 5. Migration commands

```powershell
pnpm db:migrate
```

All migrations from the workspace boundary through `ai_gateway_invocations` must apply successfully.

## 6. Seed commands

Run the idempotent seeds in dependency order:

```powershell
pnpm db:seed:workspace
pnpm db:seed:demo
pnpm db:seed:diagnostics
```

## 7. API startup command

In a separate terminal:

```powershell
pnpm dev
```

Wait for `PowerMech AI API listening on http://0.0.0.0:3000`.

## 8. Manual endpoint checks

```powershell
Invoke-RestMethod http://localhost:3000/health
Invoke-RestMethod http://localhost:3000/demo/workspace
Invoke-RestMethod http://localhost:3000/demo/repair-case
Invoke-RestMethod http://localhost:3000/demo/diagnostic-context
Invoke-RestMethod -Method Post http://localhost:3000/demo/repair-mentor/invoke
```

Every response must be JSON. The GET endpoints return HTTP `200`; the Nest POST endpoint returns HTTP `201`. Health must report `database: ok`; the demo identifiers and the controlled Repair Mentor fields must match the seeded contract.

## 9. `verify:demo:e2e` usage

With the API already running:

```powershell
pnpm verify:demo:e2e
```

The verifier calls only `http://localhost:3000`, prints `PASS` for each endpoint, stops at the first failure, and exits non-zero when any status, JSON payload, identifier, safety flag, or boundary flag is wrong.

## 10. Windows / Docker / PostgreSQL troubleshooting

- If `docker` is not recognized, install/start Docker Desktop and reopen the terminal.
- Check Docker availability with `docker version` and `docker compose version`.
- If PostgreSQL is not healthy, inspect `docker compose logs postgres`.
- Check a port conflict with `Get-NetTCPConnection -LocalPort 5432` or `Get-NetTCPConnection -LocalPort 3000`.
- If a different local PostgreSQL already owns `5432`, stop it or change the Compose mapping and matching DB configuration together.
- If migration or seed commands cannot connect, confirm Docker health and that `.env` values match the Compose credentials.
- If the verifier reports a timeout or connection failure, confirm `pnpm dev` is still running on port `3000`.
- PowerShell aliases can make `curl` behavior confusing; use `Invoke-RestMethod` or `curl.exe` explicitly.

## 11. Known limitations

- The verifier is local-only and assumes an already-running API on port `3000`.
- It does not start or stop Docker, PostgreSQL, or the API.
- Each successful Repair Mentor POST creates a new audit-log row.
- A successful POST indirectly verifies audit persistence because the AI Gateway stores the row before returning; the verifier does not query the audit table directly.
- It verifies the canonical demo scenario only.
- It is not a load, security, production-readiness, or external-provider test.

## 12. Real provider status

Real OpenAI and Claude providers are not implemented. The runtime remains on `deterministic_stub` and makes no external provider call.

## 13. Knowledge status

Knowledge Service, retrieval, shared knowledge, corporate knowledge, and global knowledge are not implemented.
