# VS-009 Evidence: 05 - Security and Secrets

## Controls

- The key is read only from `process.env`.
- The script accepts no key argument and loads no key file.
- Missing key returns `SKIPPED` before runtime or network activity.
- Temporary API stdout/stderr are suppressed.
- Raw endpoint and provider responses are not printed or stored in evidence.
- Repository validation scans VS-009 artifacts for secret-looking values.
- Repair Mentor direct provider access remains forbidden.

## Runtime key status

Presence checks before implementation and at smoke execution: no key present.

No key was requested, printed, written, or committed.
