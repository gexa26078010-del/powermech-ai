# OpenAI Key Local Smoke-Test Checklist

Use this checklist only for an explicitly authorized local provider smoke test.
Do not record or paste a credential while completing it.

## Before setting the key

- [ ] Confirm the intended branch with `git branch --show-current`.
- [ ] Confirm `git status --short` is clean.
- [ ] Confirm neither `.env` nor `.env.local` was modified or staged.
- [ ] Confirm `git check-ignore .env .env.local` lists both paths.
- [ ] Confirm the deterministic E2E baseline is known good.
- [ ] Confirm the local database is migrated and seeded.
- [ ] Confirm no process is using the configured API port.

## Set the key

- [ ] Use the masked interactive procedure in the local secret-handling runbook.
- [ ] Set it in the current PowerShell process only.
- [ ] Do not paste it into a file, command argument, shell history, chat, issue, or
  pull request.
- [ ] Set `AI_PROVIDER=openai` and the approved non-secret model separately.

## Verify safely

Run only the Boolean presence check:

```powershell
[bool]$env:OPENAI_API_KEY
```

- [ ] Confirm the result is `True`.
- [ ] Do not display or capture the variable value.

## Run

```powershell
pnpm.cmd smoke:provider:openai
```

- [ ] Record only PASS, SKIPPED, or controlled FAIL plus approved safe metadata.
- [ ] Do not record the raw response or terminal transcript.

## After the run

```powershell
Remove-Item Env:OPENAI_API_KEY -ErrorAction SilentlyContinue
Remove-Item Env:AI_PROVIDER -ErrorAction SilentlyContinue
Remove-Item Env:OPENAI_MODEL -ErrorAction SilentlyContinue
[bool]$env:OPENAI_API_KEY
git status --short
git diff --check
git diff
git diff --cached
pnpm.cmd repository:validate
```

- [ ] Confirm the Boolean result is `False`.
- [ ] Confirm no unexpected file is modified or staged.
- [ ] Review diffs locally; do not paste suspected secret output anywhere.
- [ ] Confirm the secret scan passes.
- [ ] Do not commit raw responses, logs, screenshots, or environment dumps.
- [ ] Close the PowerShell session.
