# Pilot-Readiness Checklist

## Status statement

The repository is ready for a repeatable local backend demonstration. It is not ready for a real service-center pilot or production deployment.

## Ready now

- [x] Local backend demo
- [x] Structured workspace
- [x] Structured repair case
- [x] Diagnostic context
- [x] Controlled Repair Mentor stub
- [x] Live E2E local verification

These checks describe the canonical local scenario verified in VS-006. They do not imply real-provider, security, user-experience, or production validation.

## Not ready yet

- [ ] Production deployment
- [ ] Real AI provider
- [ ] Real Knowledge Service
- [ ] Upload of documents or photos
- [ ] User accounts and authentication
- [ ] Multi-tenant production authorization
- [ ] Frontend UI
- [ ] Pilot service-center onboarding

## Required before a real pilot

- [ ] Decide a narrow pilot scope and written success criteria.
- [ ] Choose one participating service center.
- [ ] Choose one vehicle family.
- [ ] Choose one repair scenario.
- [ ] Collect and map the real diagnostic workflow for that scenario.
- [ ] Define who reviews each output and how corrections are recorded.
- [ ] Define safety disclaimers and escalation rules.
- [ ] Prepare private knowledge boundaries and access rules.
- [ ] Prepare data anonymization, retention, and deletion rules.

## Gate questions

Before pilot onboarding, the team should be able to answer:

- Who is accountable for each repair decision?
- Which data may remain inside the service center, and which data may leave it?
- What happens when context is incomplete, contradictory, or unsupported?
- How are unsafe or low-confidence outputs blocked and reviewed?
- How are provider requests and responses logged without exposing secrets?
- How can a service center export or delete its data?

## Current blockers

The largest blockers are not more demo features. They are controlled real-provider validation, authentication and authorization design, private-knowledge governance, safety review, and a narrowly agreed pilot workflow.

## Decision

Current gate: local demo ready; real pilot not ready.

Do not present this checklist as production certification, safety certification, or customer acceptance.
