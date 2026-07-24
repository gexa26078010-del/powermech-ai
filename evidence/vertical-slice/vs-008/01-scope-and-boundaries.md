# VS-008 Evidence: 01 - Scope and Boundaries

Vertical Slice: VS-008 - Controlled AI Provider Adapter

## Purpose

Add one opt-in real-provider boundary through AI Gateway while preserving the deterministic local path as the default.

## In scope

- AI Gateway provider interface and selector
- Native-fetch OpenAI Responses API adapter
- Strict structured-output request and local validation
- Environment-based opt-in configuration
- Safe failed-invocation auditing
- Narrow audit provider-key constraint migration
- Unit tests, documentation, evidence, and repository validation

## Out of scope

- Free-form chat or conversation memory
- Final diagnosis or repair approval
- Parts, warranty, or safety decisions
- Direct provider access from Repair Mentor
- Knowledge Service, retrieval, Qdrant, embeddings, or vector search
- Shared/global knowledge or anonymization
- Frontend, Telegram, n8n, CRM, billing, or analytics
- Production authentication, deployment, secret management, or provider evaluation

## Runtime boundary

The existing `POST /demo/repair-mentor/invoke` route remains the only Repair Mentor invocation route. The request is still built from the canonical workspace-scoped database context. Only AI Gateway selects and invokes a provider.

## Database boundary

The existing `DATABASE_CONNECTION` token is preserved. One migration expands only the existing `provider_key` check constraint; it adds no table, column, or cross-workspace relationship.

## Readiness boundary

VS-008 is a controlled adapter implementation for review. It is not production AI readiness, pilot readiness, or model-quality validation.
