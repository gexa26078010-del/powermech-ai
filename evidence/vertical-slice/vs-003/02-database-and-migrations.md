# Database and migrations

- Migration: `1710000000000_create_vehicle_repair_case_seed_boundary.js`.
- Tables: `vehicles`, `repair_cases`.
- Both tables require `workspace_id` referencing `workspaces(id)`.
- Vehicle model year is constrained to 1886–2200.
- Non-null VINs are unique inside a workspace.
- Case numbers are unique inside a workspace and the current status constraint permits `open` only.
- A composite foreign key enforces that each repair case and its vehicle belong to the same workspace.
- The API continues to reuse `DATABASE_CONNECTION`; no second pool or ORM was added.
