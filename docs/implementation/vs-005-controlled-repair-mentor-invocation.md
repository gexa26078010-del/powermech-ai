# VS-005 — Controlled Repair Mentor Invocation

VS-005 adds a minimal workspace-scoped Repair Mentor invocation boundary for the canonical demo repair case. `POST /demo/repair-mentor/invoke` reads the already-recorded diagnostic checks in deterministic key order, passes that exact snapshot to the AI Gateway, stores one audit row, and returns structured next-check guidance.

The AI Gateway exposes only `deterministic_stub` with prompt version `repair_mentor_first_scenario_v1` and invocation type `repair_mentor_first_scenario`. The stub accepts only the recorded first-scenario state: battery voltage passed, fuel-pump prime unknown, and spark presence not checked. Unsupported context fails closed and is logged as a failed invocation.

`ai_gateway_invocations` stores the workspace, repair case, prompt/provider metadata, request snapshot, structured response, status, and optional error. A successful response is never returned unless its audit row was persisted.

The output recommends only the next diagnostic checks. Human mechanic verification is mandatory. The slice does not provide a final diagnosis, repair approval, safety certification, warranty decision, parts decision, chat, real OpenAI/Claude provider, provider credentials, knowledge retrieval, shared/global knowledge, or VS-006 functionality.

The implementation reuses `DatabaseModule` and the exact `DATABASE_CONNECTION` token. Existing `/health`, `/demo/workspace`, `/demo/repair-case`, and `/demo/diagnostic-context` endpoints remain unchanged.
