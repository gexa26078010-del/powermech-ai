# VS-001 — Baseline & Local Runtime

Status: PENDING LOCAL/CI VERIFICATION  
Final GO: NOT GRANTED  
VS-002: LOCKED

## Commands

```bash
pnpm install
pnpm build
pnpm lint
pnpm test
pnpm repository:validate
docker compose up -d postgres
pnpm db:migrate
pnpm dev
curl http://localhost:3000/health
```

## Expected health response

```json
{"status":"ok","database":"ok","timestamp":"...","version":"0.1.0"}
```
