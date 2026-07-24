# VS-008 - Controlled AI Provider Adapter

## Purpose

VS-008 adds one opt-in OpenAI provider adapter behind the existing AI Gateway while preserving `deterministic_stub` as the safe default. It does not add a product workflow, free-form chat, Knowledge Service, final diagnosis, or repair approval.

The existing endpoint and canonical demo scenario remain unchanged:

```text
Repair Mentor
  -> AI Gateway
    -> provider selector
      -> deterministic_stub (default)
      -> openai (explicit opt-in)
    -> controlled response validator
    -> invocation audit
  -> existing Repair Mentor response
```

Repair Mentor never imports a provider, reads provider credentials, or calls an external API.

## Provider architecture

`AiGatewayProvider` defines one narrow operation: accept the existing structured diagnostic snapshot and return a candidate controlled Repair Mentor output.

`AiProviderSelector` reads `AI_PROVIDER` at invocation time:

- missing or `deterministic_stub`: select the deterministic local provider;
- `openai`: require both `OPENAI_API_KEY` and `OPENAI_MODEL`, then select the OpenAI adapter;
- any other value: fail closed as invalid configuration.

Selection at invocation time allows a failed opt-in configuration attempt to be written to the existing `ai_gateway_invocations` audit table. It does not silently fall back to the stub when `openai` was explicitly requested.

The narrow VS-008 migration expands the existing provider check constraint to permit:

- `deterministic_stub`
- `openai`
- `invalid_configuration`

It adds no table and changes no data ownership boundary.

## Deterministic default

The default remains:

```text
AI_PROVIDER=deterministic_stub
```

No external provider key is read or required in this mode. Build, lint, tests, repository validation, and the canonical local E2E verifier remain deterministic and make no external provider call.

## Optional OpenAI mode

The OpenAI adapter uses Node's native `fetch`; no provider SDK dependency is added. It sends one non-streaming request to the OpenAI Responses API with:

- a fixed system instruction;
- only the existing structured diagnostic snapshot as input;
- `store: false`;
- a strict JSON Schema for the existing controlled output;
- no tools, memory, thread, retrieval, or arbitrary chat history.

The implementation follows the official [Responses API quickstart](https://developers.openai.com/api/docs/quickstart) and [Structured Outputs guide](https://developers.openai.com/api/docs/guides/structured-outputs).

The model value in `.env.example` is a documented placeholder, not a production model decision.

## Environment variables

```text
AI_PROVIDER=deterministic_stub
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5-mini
```

Rules:

- Keep `AI_PROVIDER=deterministic_stub` for normal local development.
- Never commit a real `OPENAI_API_KEY`.
- Inject secrets through a local shell or approved secret manager only.
- Do not log or print the key.
- Do not add a configurable provider URL; the adapter uses the fixed HTTPS endpoint.

## Fail-closed behavior

The invocation is audited as failed and no Repair Mentor guidance is returned when:

- `AI_PROVIDER` is unsupported;
- `openai` is selected without a key or model;
- the request times out or transport fails;
- OpenAI returns a non-success status;
- the response body is invalid JSON;
- no structured output is present;
- the structured output is not valid JSON;
- the candidate output violates the local controlled-response validator;
- the audit row cannot be persisted.

Provider error bodies are not returned or stored. Configuration errors do not echo the rejected provider value. A failed real-provider request never falls back to deterministic guidance.

## Response safety

The OpenAI request asks for strict JSON Schema output, and AI Gateway validates the parsed value again locally before it can be logged as successful or returned.

The local validator requires:

- only the existing top-level fields;
- bounded non-empty summary, warnings, and limitations;
- one to five structured next checks;
- bounded non-empty next-check fields and an integer priority;
- `humanVerificationRequired: true`;
- `finalDiagnosisProvided: false`;
- `repairApprovalProvided: false`;
- no additional free-form fields.

`realProviderUsed` is true only after the selected real provider returns output that passes local validation and its audit row is persisted.

## No direct provider bypass

Provider selection, transport, validation, and audit remain inside `apps/api/src/ai-gateway/`. Repair Mentor depends only on `AiGatewayService` and maps the gateway result into the existing HTTP response.

Repository validation scans Repair Mentor source and fails if it contains native provider transport, provider credentials, provider endpoints, or a direct OpenAI/Claude adapter import.

## Static testing

No provider secret or live API call is needed:

```powershell
pnpm.cmd install
pnpm.cmd build
pnpm.cmd lint
pnpm.cmd test
pnpm.cmd repository:validate
```

The unit tests mock `fetch` and cover deterministic default selection, OpenAI opt-in selection, missing configuration, unsupported provider configuration, safe HTTP errors, missing structured output, invalid controlled output, failed-invocation audit data, and dynamic `realProviderUsed`.

## Deterministic local E2E

Apply migrations and use the default provider. With the currently installed
`node-pg-migrate`, `-d` names the environment variable that contains the URL.
The repository's pre-existing `db:migrate` script passes the URL directly to
`-d` and fails locally, so VS-008 runtime verification used:

```powershell
$env:DATABASE_URL='postgres://powermech_dev:dev_local_only@localhost:5432/powermech_ai_dev'
node_modules\.bin\node-pg-migrate.cmd up -m ./migrations
pnpm.cmd dev
pnpm.cmd verify:demo:e2e
```

The existing verifier still requires `providerKey: deterministic_stub` and `realProviderUsed: false`.
Correcting the pre-existing package migration scripts is separate repository
tooling work and is not hidden inside the provider-adapter slice.

## Later controlled real-provider test

A live test is optional and must be explicitly approved. If an authorized key is already available:

1. Apply migrations.
2. Set `AI_PROVIDER=openai` in the process environment.
3. Set an approved `OPENAI_MODEL`.
4. Inject `OPENAI_API_KEY` without writing it to the repository or terminal history.
5. Start the API.
6. Invoke only `POST /demo/repair-mentor/invoke`.
7. Confirm the response passes all safety flags and the audit row records `provider_key = 'openai'`.
8. Remove the provider environment variables after the test.

Do not use `verify:demo:e2e` for the real-provider mode because that verifier intentionally asserts the deterministic contract.

## Limitations

- No live provider call is part of automated tests or CI.
- The adapter covers one canonical Repair Mentor invocation only.
- The model placeholder is not a model-quality or production-cost decision.
- There is no retry, streaming, tool use, conversation memory, or fallback.
- Provider latency and model are not yet separate audit columns.
- Rolling the provider constraint migration down requires that no non-deterministic audit rows remain.
- The pre-existing package migration scripts are incompatible with the installed `node-pg-migrate` `-d` semantics; use the documented `DATABASE_URL` invocation until that tooling is corrected separately.
- Production secret management, egress policy, rate limiting, observability, and provider evaluation are not implemented.
- Knowledge Service, document retrieval, shared/global knowledge, authentication, UI, and production deployment are not implemented.

## Next steps

Run one explicitly approved manual provider test, review the resulting structured output and audit row, and decide whether the adapter boundary is acceptable. Do not proceed to Knowledge Service or UI work until this gate is reviewed.
