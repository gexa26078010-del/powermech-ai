# VS-004 — Diagnostic Context Recording

VS-004 adds structured, workspace-scoped diagnostic checks and measurements to the existing demo repair case. Composite foreign keys enforce that each check belongs to a repair case in the same workspace and that each measurement belongs to the same workspace, repair case, and check.

Run migrations, then seed prerequisites in order with `pnpm db:seed:workspace` and `pnpm db:seed:demo`. Run `pnpm db:seed:diagnostics` last. The diagnostic seed fails clearly when the canonical workspace or repair case is missing, never creates either prerequisite, and uses workspace/repair-case-scoped conflict targets for idempotency.

`GET /demo/diagnostic-context` returns checks ordered by `check_key`, with measurements ordered by `measurement_key` and nested under their checks. Existing `/health`, `/demo/workspace`, and `/demo/repair-case` endpoints are preserved.

This slice records factual diagnostic context only. It does not implement AI, Repair Mentor, recommendations, repair steps, final diagnosis, automated conclusions, Knowledge Service, or shared/global knowledge. Final GO remains pending review and VS-005 remains locked.
