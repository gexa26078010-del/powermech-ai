# DB-MIGRATE-FIX Evidence: 01 - Summary

Date: 2026-07-24

## Preflight

- Branch: `agent/db-migrate-fix`
- Worktree before implementation: clean
- Starting commit: `f967095 VS-008: record final gate`
- VS-008 gate:
  `evidence/vertical-slice/vs-008/06-final-gate.md`
- Required gate text found: `FINAL GO GRANTED`
- Preflight result: PASS

## Root cause

The installed `node-pg-migrate` 7.9.1 CLI defines `-d` as the name of the
environment variable that holds the database URL. The previous package scripts
passed the URL itself. The PostgreSQL client consequently received incomplete
connection data and failed with `client password must be a string`.

The old `db:reset` command also used `-t 0`; `-t` names the migrations table.
The supported all-migrations rollback form is positional `down 0`.

## Implementation

- Added `scripts/run-migrations.js`.
- Normalized `db:migrate`, `db:migrate:down`, and `db:reset` to call the helper.
- Read and validated the existing five `DB_*` settings.
- Constructed `DATABASE_URL` internally and passed it only to the child process.
- Invoked the installed CLI directly through Node with `shell: false`.
- Added narrow repository checks plus implementation documentation and evidence.

## Scope

No dependency, lockfile, migration, schema, application runtime, AI Gateway, or
Repair Mentor change was made. No product feature or production deployment
behavior was added.
