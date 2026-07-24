# SECURITY-001 Evidence: 01 - Scope and Boundaries

## Purpose

Document session-only local handling of a provider credential before any
authorized live smoke test.

## In scope

- local secret-handling documentation;
- a concise local smoke-test checklist;
- README discoverability links;
- repository validation for artifacts, ignored env files, safe examples, and
  secret-looking values;
- SECURITY-001 evidence.

## Boundaries

- No credential was requested, read, printed, stored, or committed.
- No provider runtime or live call was executed.
- No `.env` or `.env.example` change was needed.
- No application, AI Gateway, Repair Mentor, migration, schema, dependency, or
  product behavior changed.
- No GitHub Secret or production secret manager was created.
