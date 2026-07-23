# Scope and boundaries

- Branch: `agent/vs-005-controlled-repair-mentor-invocation`.
- Scope: controlled workspace- and repair-case-scoped Repair Mentor invocation for the canonical first scenario only.
- The existing VS-002 workspace, VS-003 repair case, and VS-004 diagnostic context are required.
- Provider: deterministic local stub only.
- No real provider, credentials, free-form chat, final diagnosis, repair approval, Knowledge Service, shared/global knowledge, or VS-006 work was implemented.
- VS-006 remains locked.

## Files changed

- `.github/workflows/repository-validation.yml`
- `apps/api/src/app.module.ts`
- `apps/api/src/health/health.controller.spec.ts`
- `apps/api/src/ai-gateway/ai-gateway.module.ts`
- `apps/api/src/ai-gateway/ai-gateway.service.ts`
- `apps/api/src/ai-gateway/ai-gateway.service.spec.ts`
- `apps/api/src/ai-gateway/ai-gateway.types.ts`
- `apps/api/src/ai-gateway/deterministic-stub.provider.ts`
- `apps/api/src/repair-mentor/repair-mentor.module.ts`
- `apps/api/src/repair-mentor/repair-mentor.controller.ts`
- `apps/api/src/repair-mentor/repair-mentor.controller.spec.ts`
- `apps/api/src/repair-mentor/repair-mentor.service.ts`
- `apps/api/src/repair-mentor/repair-mentor.service.spec.ts`
- `apps/api/src/repair-mentor/repair-mentor.types.ts`
- `docs/implementation/vs-005-controlled-repair-mentor-invocation.md`
- `evidence/vertical-slice/vs-005/01-scope-and-boundaries.md`
- `evidence/vertical-slice/vs-005/02-database-and-migrations.md`
- `evidence/vertical-slice/vs-005/03-ai-gateway-and-provider.md`
- `evidence/vertical-slice/vs-005/04-repair-mentor-api-and-tests.md`
- `evidence/vertical-slice/vs-005/05-ci-and-validation.md`
- `evidence/vertical-slice/vs-005/06-final-gate.md`
- `migrations/1730000000000_create_ai_gateway_invocation_log.js`
- `scripts/validate-repository.js`
