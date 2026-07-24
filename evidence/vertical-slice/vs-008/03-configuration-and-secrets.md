# VS-008 Evidence: 03 - Configuration and Secrets

## Documented configuration

`.env.example` contains:

```text
AI_PROVIDER=deterministic_stub
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5-mini
```

The key placeholder is empty. No real or secret-looking provider credential is committed.

## Safe default

When `AI_PROVIDER` is absent or equals `deterministic_stub`, AI Gateway uses the deterministic provider. No provider key is required for local development, build, lint, tests, repository validation, or deterministic E2E.

## OpenAI opt-in

OpenAI requires:

- `AI_PROVIDER=openai`
- a non-empty `OPENAI_API_KEY`
- a non-empty `OPENAI_MODEL`

Missing values fail at invocation before any network call. Unsupported provider values fail without being echoed into the audit error.

## Secret controls

- The key is read only inside AI Gateway configuration/transport classes.
- Repair Mentor does not read provider environment variables.
- Provider response bodies are not included in HTTP or audit errors.
- The provider URL is fixed and not environment-configurable.
- Unit tests use a short explicit test token and mocked fetch only.
- Repository validation rejects secret-looking key material.

## Real provider status

No real key was requested, printed, stored, or used by VS-008 automated verification.
