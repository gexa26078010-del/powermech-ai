# VS-007 Evidence: 01 - Scope and Boundaries

Vertical Slice: VS-007 - MVP Demo Packaging and Pilot Readiness

## Purpose

Package the already verified local MVP backend demo so the founder can understand, repeat, explain, and show it without changing product behavior.

## In scope

- Local demo runbook
- Founder/pilot narrative
- Source-backed API examples
- Pilot-readiness checklist
- Controlled next-step recommendation
- Repository validation for VS-007 artifacts
- Canonical VS-007 evidence
- Short README links

## Out of scope

- Application runtime behavior
- New endpoints or product features
- Real OpenAI or Claude providers
- Provider credentials
- Knowledge Service, retrieval, Qdrant, embeddings, or vector search
- Shared/global knowledge
- Document/photo upload, OCR, or object storage
- UI, Telegram, n8n, CRM, billing, or analytics
- Authentication or production authorization
- Production deployment

## Change boundary

No file under `apps/api/src` is added or modified. `package.json`, migrations, dependencies, and runtime configuration are unchanged. The only executable-code change is the required repository validator update that checks documentation/evidence presence and the forbidden non-canonical evidence path.

## Readiness boundary

VS-007 packages a local demo. It does not grant Final GO, claim production readiness, or claim real-pilot readiness.

Canonical evidence path: `evidence/vertical-slice/vs-007/`

Forbidden evidence path: `evidence/vs-007`
