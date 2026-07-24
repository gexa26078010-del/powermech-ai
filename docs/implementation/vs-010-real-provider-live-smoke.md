# VS-010 Real Provider Live Smoke Verification

## Purpose

VS-010 records one controlled live-provider connectivity check through the
existing PowerMech AI API and AI Gateway boundary. It does not evaluate prompt
quality, repair quality, production readiness, or pilot readiness.

## Scope

The smoke path is:

1. `POST /demo/repair-mentor/invoke`;
2. Repair Mentor gathers the seeded diagnostic snapshot;
3. AI Gateway explicitly selects `openai`;
4. the existing OpenAI adapter makes the provider request;
5. the controlled-output validator enforces the existing response contract;
6. AI Gateway records the existing invocation audit before the API succeeds.

Repair Mentor does not import an OpenAI or Claude adapter and does not call a
provider endpoint directly. No endpoint, provider behavior, schema, migration,
or product feature is added by VS-010.

## SECURITY-001 prerequisite

Use the
[local secret-handling runbook](../security/local-secret-handling-runbook.md)
and its checklist before any live run. The key must be supplied through the
current PowerShell process environment only. Use masked interactive input from
that runbook; do not put the value in a command, file, chat, screenshot, log, or
evidence record.

Verify presence without revealing the value:

```powershell
[bool]$env:OPENAI_API_KEY
```

Only a Boolean result may be recorded.

## Deterministic baseline

The local baseline requires no provider credential:

```powershell
$env:AI_PROVIDER = 'deterministic_stub'
docker compose up -d postgres
pnpm.cmd db:migrate
pnpm.cmd db:seed:workspace
pnpm.cmd db:seed:demo
pnpm.cmd db:seed:diagnostics
pnpm.cmd build
pnpm.cmd start
```

Run `pnpm.cmd verify:demo:e2e` from another PowerShell session, then stop the
temporary API process. The repository default remains `deterministic_stub`.

## Controlled live smoke

After the deterministic baseline passes and the key is present in the current
PowerShell process, set only the non-secret selector values:

```powershell
$env:AI_PROVIDER = 'openai'
$env:OPENAI_MODEL = 'gpt-5-mini'
pnpm.cmd smoke:provider:openai
```

The smoke script suppresses temporary API output, invokes the existing local
Repair Mentor endpoint, and validates provider selection plus the controlled
safety flags. It does not call the provider endpoint directly.

Remove the smoke variables immediately after the run using the SECURITY-001
cleanup procedure. Confirm key removal with the Boolean-only presence check.

## Outcomes

- `PASS`: the existing local route completed through the selected provider and
  passed the smoke script's controlled contract checks.
- `FAIL`: the script returned a controlled failure without exposing the key or a
  raw provider response.
- `BLOCKED`: the key or local runtime prerequisite was unavailable.

A skipped or blocked run is not sufficient for a VS-010 GO recommendation.

## Recorded verification

The founder reported the following manual local run:

- OPENAI_API_KEY presence before smoke: yes
- provider selected: openai
- model: gpt-5-mini
- live provider smoke: PASS
- raw response stored: no
- key printed: no
- key committed: no
- key removed after run: yes
- OPENAI_API_KEY presence after cleanup: no

Codex did not receive or inspect the key and did not rerun the live smoke. Codex
independently ran the deterministic baseline and repository checks.

## Evidence rules

Evidence may contain only status, provider, model, Boolean key presence,
controlled safety flags, validation results, and cleanup confirmation. It must
not contain the credential, authorization headers, a raw provider request or
response, unrestricted model output, an environment dump, logs, or screenshots.

## Safety boundaries and limitations

The controlled contract requires human verification, no final diagnosis, and no
repair approval. Knowledge Service, shared/global knowledge, Qdrant, embeddings,
vector search, free-form chat, and production secret management are not
implemented.

The manual PASS proves only the tested connectivity path at that time. It does
not validate provider availability over time, model quality, repair correctness,
production security, billing controls, safety certification, or pilot readiness.

## Next steps

A reviewer must inspect the safe evidence and repository diff. Final GO remains
outside this implementation task, and the branch must not be merged without the
separate review decision.
