# Migrations and seeds

- VS-006 adds no migration and changes no existing migration or seed.
- Required runtime order: `pnpm db:migrate`, `pnpm db:seed:workspace`, `pnpm db:seed:demo`, `pnpm db:seed:diagnostics`.

## Runtime result

Status: **NOT EXECUTED / BLOCKED**

Docker is unavailable and no PostgreSQL listener is present on `localhost:5432`. Per the runtime stop condition, `pnpm db:migrate`, `pnpm db:seed:workspace`, `pnpm db:seed:demo`, and `pnpm db:seed:diagnostics` were not executed.
