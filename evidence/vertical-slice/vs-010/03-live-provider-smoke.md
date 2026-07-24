# VS-010 Evidence: 03 - Live Provider Smoke

Status: PASS

Execution source: founder-reported manual local PowerShell run

Safe result metadata:

- provider selected: openai
- model: gpt-5-mini
- live provider smoke: PASS
- route: existing `POST /demo/repair-mentor/invoke`
- provider boundary: existing AI Gateway adapter
- controlled output validation: required and passed by the smoke script
- human verification required: yes
- final diagnosis provided: no
- repair approval provided: no
- raw response stored: no

The live command was `pnpm.cmd smoke:provider:openai`. Codex did not rerun it
after the founder removed the key. A successful API response requires the
existing AI Gateway invocation and audit write to complete; no raw audit payload
was inspected or copied into evidence.
