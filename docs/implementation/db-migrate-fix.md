# DB-MIGRATE-FIX: Local Migration Command

## Problem

The package scripts passed a PostgreSQL URL directly to `node-pg-migrate -d`.
In the installed `node-pg-migrate` 7.9.1 CLI, `-d` means
`--database-url-var`: it expects the name of an environment variable containing
the URL. Treating the URL as an environment-variable name left the PostgreSQL
client with incomplete connection data and produced `client password must be a
string`.

The old `db:reset` script also used `-t 0`, but `-t` selects the migrations table
name. The CLI's positional `down 0` form is the supported way to roll down all
applied migrations before migrating up again.

## Implementation

The three package commands now delegate to `scripts/run-migrations.js`:

```powershell
pnpm.cmd db:migrate
pnpm.cmd db:migrate:down
pnpm.cmd db:reset
```

The helper:

- reads `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME`;
- uses the existing `.env.example` local values when a variable is absent;
- rejects empty values and invalid ports before starting the migration process;
- constructs `DATABASE_URL` internally with URL-safe credentials;
- supplies the URL only through the child process environment;
- invokes the installed CLI through Node with `shell: false`;
- never prints the URL or password.

No dependency, migration, schema, API, AI Gateway, or Repair Mentor behavior was
changed.

## Local use

Start the repository PostgreSQL service and apply migrations:

```powershell
docker compose up -d postgres
pnpm.cmd db:migrate
```

Re-running `pnpm.cmd db:migrate` is safe; the CLI reports that no migrations need
to run. To override the local defaults, set the five `DB_*` variables in the
current process environment before running a command. The helper does not print
the resolved connection string.

Expected output after applying pending migrations ends with:

```text
Migrations complete!
```

When the database is current, the command reports:

```text
No migrations to run!
Migrations complete!
```

`pnpm.cmd db:reset` is destructive. It rolls down every applied migration and
then applies all migrations again. Use it only against the intended local
development database.

For a complete local Docker reset, first verify the Compose project and volume,
then run:

```powershell
docker compose down -v
docker compose up -d postgres
pnpm.cmd db:migrate
pnpm.cmd db:seed:workspace
pnpm.cmd db:seed:demo
pnpm.cmd db:seed:diagnostics
```

`docker compose down -v` permanently removes the local database volume. This
workflow and verification make no production-readiness or production-deployment
claim.
