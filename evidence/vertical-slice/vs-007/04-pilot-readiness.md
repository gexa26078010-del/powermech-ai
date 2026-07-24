# VS-007 Evidence: 04 - Pilot Readiness

Primary artifacts:

- `docs/demo/pilot-readiness-checklist.md`
- `docs/demo/next-steps-after-local-demo.md`

## Ready now

- Local backend demo
- Structured workspace and repair case
- Structured diagnostic context
- Controlled Repair Mentor stub
- Local E2E verification for the canonical scenario

## Not ready

- Real service-center pilot
- Production deployment
- Real AI provider
- Knowledge Service or document ingestion
- User accounts, authentication, and production authorization
- Frontend workflow

## Required pilot preparation

A real pilot requires one service center, one vehicle family, one repair scenario, a mapped real diagnostic workflow, human review rules, safety disclaimers, private-knowledge boundaries, and anonymization/retention rules.

## Recommended next gate

Use VS-008 or PR-043 for one controlled real-provider adapter through the AI Gateway, with a manual prompt test, strict structured-output validation, provider logging, failure auditing, and no direct provider bypass.

Knowledge Service, document ingestion, shared/global knowledge, and UI remain later work.

## Decision

Local demo packaging: ready for review.

Pilot readiness: not granted.

Production readiness: not granted.
