# VS-009 - Controlled Real Provider Smoke Test

## Purpose and scope

VS-009 adds a local, opt-in runtime smoke test around the controlled OpenAI
provider path created in VS-008. It proves only that an explicitly configured
real-provider invocation can travel through the existing Repair Mentor endpoint,
AI Gateway selection, provider adapter, controlled-output validation, and audit
boundary.

This is connectivity and boundary validation only. It does not evaluate provider
quality, repair intelligence, production readiness, pilot readiness, or model
suitability. It adds no endpoint and does not change provider API semantics.

## Preserved architecture

```text
smoke-test script
  -> existing POST /demo/repair-mentor/invoke
    -> RepairMentorService
      -> AiGatewayService
        -> AiProviderSelector
          -> existing OpenAiProvider
        -> existing controlled-output validator
        -> existing ai_gateway_invocations audit
```

The script does not import a provider adapter and contains no external provider
URL. Repair Mentor still has no direct OpenAI or Claude dependency.

## Required environment

Normal local development remains:

```text
AI_PROVIDER=deterministic_stub
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5-mini
```

No provider secret is needed for install, build, lint, tests, repository
validation, migrations, seeds, or deterministic E2E.

For an explicitly authorized smoke test, set these values only in the local
process environment:

```powershell
$env:AI_PROVIDER='openai'
$env:OPENAI_MODEL='<approved-model>'
$env:OPENAI_API_KEY='<injected-locally>'
pnpm.cmd smoke:provider:openai
```

Do not paste a key into chat, source, documentation, evidence, shell scripts, or
command history. Prefer an approved local secret-injection mechanism. Remove the
three process variables after the test.

## Deterministic local demo

Run the default baseline without any provider secret:

```powershell
docker compose up -d postgres
pnpm.cmd db:migrate
pnpm.cmd db:seed:workspace
pnpm.cmd db:seed:demo
pnpm.cmd db:seed:diagnostics
pnpm.cmd build
pnpm.cmd start
pnpm.cmd verify:demo:e2e
```

The deterministic verifier requires `providerKey: deterministic_stub` and
`realProviderUsed: false`.

## Smoke-test behavior

Prepare the migrated and seeded local database, stop any process on the configured
API port, then run:

```powershell
pnpm.cmd build
pnpm.cmd smoke:provider:openai
```

The script:

- reads the key only from `process.env`;
- returns `SKIPPED` with exit code 0 before build/database/network access when the
  key is absent;
- requires explicit `AI_PROVIDER=openai` and a safe non-empty model when a key is
  present;
- starts a temporary built API with child output suppressed;
- invokes only the existing Repair Mentor endpoint;
- validates the selected provider, success status, real-provider boundary, and
  three mandatory safety flags;
- stops the temporary API in all outcomes;
- never prints the key or raw provider/Repair Mentor response.

Expected outcomes:

- `PASS`: the existing path returned a validated, audited real-provider result.
- `SKIPPED`: no key was present in `process.env`; no provider call occurred.
- `FAIL`: configuration, startup, transport, endpoint, validation, or audit
  behavior failed closed. A FAIL must be reviewed; there is no stub fallback.

## Recorded and excluded data

Safe metadata may include only provider selection, configured model name, runtime
status, validation status, and confirmation that audit persistence was required
before success. The raw key and raw provider response are never printed or copied
into evidence. Token usage is not recorded.

## Safety boundary

Every accepted response must keep:

- `humanVerificationRequired: true`
- `finalDiagnosisProvided: false`
- `repairApprovalProvided: false`

No final diagnosis, repair approval, parts decision, warranty decision, or safety
certification is added.

## Limitations and next steps

A PASS proves one narrow runtime path, not output quality or production safety. A
SKIPPED run proves guard behavior only. CI does not require a secret or live
provider call. There is no retry, streaming, chat, memory, Knowledge Service,
retrieval, UI, production secret manager, or deployment work.

After review, an authorized operator may run one controlled local smoke test and
review only its safe status and audit metadata. Expansion requires a separate
scope and gate.
