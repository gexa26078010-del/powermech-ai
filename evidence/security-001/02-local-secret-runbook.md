# SECURITY-001 Evidence: 02 - Local Secret Runbook

The runbook documents:

- credential classification and prohibited storage/output locations;
- clean-branch and ignored-file checks;
- masked PowerShell input without placing the key in command history;
- Boolean-only presence verification;
- deterministic development without a key;
- the existing provider smoke command for a later authorized run;
- immediate process-environment cleanup;
- local status, diff, and repository-validation checks;
- safe evidence metadata and prohibited evidence;
- immediate revocation/rotation and coordinated Git cleanup after exposure;
- explicit non-production limitations.

The companion checklist reduces this to a before/set/verify/run/cleanup sequence.
Neither document contains a real or secret-looking key.
