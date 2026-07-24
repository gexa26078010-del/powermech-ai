# PowerMech AI MVP Demo Narrative

## What PowerMech AI is

PowerMech AI is an AI Operating System and SaaS platform being designed for service centers. Its first market is powersport service: ATV, UTV, jet ski, and snowmobile.

The mission is:

> We do not automate repair. We scale human experience.

That means the system should help a mechanic preserve context, follow a disciplined diagnostic process, and reuse verified experience. It must not pretend to replace the mechanic's judgment.

## The problem

Service knowledge is often fragmented across people, notes, manuals, past jobs, and memory. A less-experienced mechanic may know the symptom but not the best next check. A senior mechanic may repeatedly answer the same questions while important diagnostic context is lost between jobs.

PowerMech AI aims to structure that context and make assistance traceable. The local MVP demonstrates the smallest backend boundary needed to discuss that direction honestly.

## The demo scenario

The demo uses a fictional service center, a fictional 2024 1000cc ATV model family, and one repair case:

> Starter cranks, engine does not start.

The seeded diagnostic context records three facts:

- Static battery voltage passed at `12.6 V`.
- Fuel-pump prime is not confirmed.
- Spark presence has not been checked.

No customer or production data is involved.

## Mechanic workflow

1. The repair case belongs to one service-center workspace.
2. The vehicle and customer complaint establish the scenario.
3. Diagnostic checks record what the mechanic has observed, including unknown and not-yet-checked states.
4. The mechanic invokes Repair Mentor.
5. Repair Mentor receives the recorded snapshot through the AI Gateway boundary.
6. The response proposes the next checks: confirm fuel-pump prime, then check spark presence.
7. A human mechanic verifies the facts and decides what to do.

The response is structured and auditable. A successful invocation is not returned unless its audit row is persisted.

## What Repair Mentor does

In this demo, Repair Mentor summarizes the existing diagnostic context and returns controlled next-check guidance, priorities, safety warnings, and explicit limitations.

The provider is a deterministic local stub. It is useful for proving the invocation contract and safety boundaries without implying that a real model is integrated.

## What Repair Mentor does not do

Repair Mentor does not provide a final diagnosis, approve a repair, authorize parts replacement, certify safety, make a warranty decision, or call OpenAI or Claude. It does not retrieve manuals or shared knowledge.

The current output is valid only for the canonical seeded scenario. Unsupported diagnostic context fails closed.

## Why human verification is required

Repair work affects safety, cost, and customer trust. Recorded data may be incomplete or wrong, and future model output may also be wrong. The mechanic remains responsible for confirming observations, following service procedures, and making the repair decision. The API therefore returns `humanVerificationRequired: true`, `finalDiagnosisProvided: false`, and `repairApprovalProvided: false`.

## Why service-center isolation matters

A service center's cases, observations, and operational experience can be private and commercially sensitive. The current data model scopes the demo workspace, vehicle, repair case, diagnostics, and invocation audit to explicit workspace boundaries. This is a structural foundation, not a claim that production authentication or tenant authorization is complete.

## Why shared/global knowledge is not implemented

Sharing knowledge safely requires governance: provenance, verification, permissions, anonymization, conflict handling, and removal rules. Implementing retrieval before those boundaries are defined would overstate trust and create data-leakage risk.

For that reason, the current responses explicitly report that shared/global knowledge and knowledge retrieval are not implemented. A later Knowledge Service should be introduced only after private boundaries and verification rules are designed and reviewed.

## Founder and pilot takeaway

The demo shows a coherent local backend story: structured service-center context can flow into controlled, auditable assistance while the mechanic remains in control. It is a foundation for learning with a narrowly scoped future pilot, not a finished product or production deployment.
