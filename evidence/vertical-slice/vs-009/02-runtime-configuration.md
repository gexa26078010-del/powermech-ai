# VS-009 Evidence: 02 - Runtime Configuration

## Default

`.env.example` remains unchanged:

```text
AI_PROVIDER=deterministic_stub
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5-mini
```

Build, lint, tests, repository validation, migrations, seeds, and deterministic
E2E require no provider secret.

## Explicit opt-in

A live smoke test requires all three values in the current process environment:

- `AI_PROVIDER=openai`
- non-empty `OPENAI_API_KEY`
- safe non-empty `OPENAI_MODEL`

The script does not load a key from `.env` and does not accept a key argument.
Missing key status is `SKIPPED`, before build/database/network access.
