# VS-007 Evidence: 03 - Demo Narrative

Primary artifacts:

- `docs/demo/mvp-demo-narrative.md`
- `docs/demo/mvp-api-examples.md`

## Founder story

The packaged story explains one fictional powersport service scenario: a starter cranks, but the engine does not start. Recorded context shows acceptable battery voltage, unconfirmed fuel-pump prime, and spark not yet checked.

Repair Mentor returns controlled next checks through the AI Gateway and requires a mechanic to verify the facts. It does not diagnose, approve repairs, choose parts, or certify safety.

## Contract accuracy

API examples are based on current service mappings and automated-test expectations. They are labeled representative because runtime timestamps and latency vary. The guide explains preserved endpoint-era boundary flags so readers do not mistake them for a current repository-wide capability inventory.

## Mission alignment

The narrative connects the mechanic-in-control workflow to:

> We do not automate repair. We scale human experience.

## Explicit limitations

- The provider is `deterministic_stub`.
- Real OpenAI/Claude integration is absent.
- Knowledge Service and retrieval are absent.
- Shared/global knowledge is absent.
- Production authentication and authorization are absent.
- The demo uses fictional seeded data.
