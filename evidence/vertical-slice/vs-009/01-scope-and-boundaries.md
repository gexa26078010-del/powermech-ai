# VS-009 Evidence: 01 - Scope and Boundaries

## Purpose

Add opt-in smoke-test infrastructure around the existing VS-008 provider path.
This slice does not redesign the adapter or add a product capability.

## In scope

- one local smoke-test script;
- one package command;
- static guardrail tests;
- repository validation;
- documentation and evidence;
- deterministic baseline and safe smoke verification.

## Boundaries preserved

- `deterministic_stub` remains the default.
- Repair Mentor invokes providers only through AI Gateway.
- The existing endpoint, provider selector, adapter, validator, and audit path are
  unchanged.
- Human verification remains mandatory.
- Final diagnosis and repair approval remain prohibited.

## Out of scope

Provider quality, model selection, production readiness, Knowledge Service,
retrieval, Qdrant, embeddings, vector search, chat, memory, UI, Telegram, n8n,
CRM, billing, analytics, authentication, and deployment are not implemented.
