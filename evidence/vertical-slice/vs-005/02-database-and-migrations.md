# Database and migrations

- Migration: `1730000000000_create_ai_gateway_invocation_log.js`.
- Table: `ai_gateway_invocations`.
- Every row is linked to a workspace and a repair case through a composite workspace/case foreign key.
- Status is constrained to `succeeded` or `failed`.
- Provider is constrained to `deterministic_stub`.
- Prompt version is constrained to `repair_mentor_first_scenario_v1`.
- Invocation type is constrained to `repair_mentor_first_scenario`.
- Request and response payloads are required JSONB audit snapshots.
- No result, message, thread, diagnosis, knowledge, or training table was added.
- The implementation reuses `DATABASE_CONNECTION`; no second pool or ORM was added.
- Migration JavaScript syntax and generated up/down SQL inspection: PASS.
- Database migration execution: **BLOCKED / NOT EXECUTED** because Docker/PostgreSQL was unavailable.
