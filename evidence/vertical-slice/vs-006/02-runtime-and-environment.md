# Runtime and environment

- Expected API base URL: `http://localhost:3000`.
- Expected PostgreSQL endpoint: `localhost:5432`.
- Expected Compose service: `postgres`.
- E2E verifier starts neither Docker nor the API and performs no external request.

## Runtime availability result

Status: **BLOCKED**

- `Get-Command docker`: `docker: NOT FOUND` (exit `1`).
- `Get-Command psql`: `psql: NOT FOUND` (exit `1`).
- PostgreSQL listener check: `PostgreSQL port 5432: NOT LISTENING` (exit `1`).
- `docker compose up -d postgres` was not executed because the Docker command is unavailable.
- PostgreSQL, migrations, seeds, API startup, and endpoint verification were not executed after the required stop condition was reached.
