# Database and migrations

- Migration: `1720000000000_create_diagnostic_context_boundary.js`.
- Tables: `diagnostic_checks`, `diagnostic_measurements`.
- Checks require the same workspace and repair case through a composite foreign key.
- Measurements require the same workspace, repair case, and diagnostic check through a composite foreign key.
- Check status/result values and measurement value presence are constrained.
- Required workspace-scoped uniqueness constraints are present.
- The API continues to reuse `DATABASE_CONNECTION`; no second pool or ORM was added.
