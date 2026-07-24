# Local Secret-Handling Runbook

## Purpose

This runbook defines the local, session-only handling procedure for an
`OPENAI_API_KEY` before any authorized real-provider smoke test. It reduces the
risk of putting a credential into source control, documentation, evidence,
terminal transcripts, chat, or other durable storage.

Secret handling must be reviewed before a live smoke test because a provider key
authorizes API use and may expose account access or billing scope. Treat it as a
bearer credential: anyone who obtains it may be able to use it until it is
revoked.

This procedure is local-development guidance only. It is not a production secret
manager, production security readiness, or authorization to run a live provider
test.

## Never store the key here

For the controlled local smoke workflow, the key must not be written to:

- `.env`, `.env.local`, `.env.example`, or another repository file;
- source, tests, scripts, package configuration, or shell scripts;
- documentation, evidence, README files, or commit messages;
- application logs, terminal transcripts, screenshots, clipboard managers, or
  exported shell history;
- GitHub issues, pull requests, comments, Actions logs, or repository secrets
  created without a separately approved process;
- ChatGPT, Codex prompts, email, Slack, Teams, or another chat system.

Ignored files reduce accidental Git staging but are not a secret-management
system. SECURITY-001 uses the current PowerShell process environment only.

## Before setting the key

From the repository root, confirm the intended branch and a clean worktree:

```powershell
git branch --show-current
git status --short
git check-ignore .env .env.local
```

Expected branch for this runbook change is
`agent/security-001-local-secret-handling-runbook`. A later authorized smoke run
must use its explicitly approved branch.

`git check-ignore` should list both local environment paths. Stop if the
worktree is dirty for an unexplained reason, either path is not ignored, or the
deterministic baseline is not already known good.

## Set the key for the current PowerShell session

Use masked interactive input so the credential is not placed in command history
or displayed while typing:

```powershell
$secureProviderKey = Read-Host 'Enter the provider key for this PowerShell session' -AsSecureString
$providerKeyPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureProviderKey)
try {
  $env:OPENAI_API_KEY = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($providerKeyPointer)
} finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($providerKeyPointer)
  $secureProviderKey.Dispose()
  Remove-Variable secureProviderKey, providerKeyPointer -ErrorAction SilentlyContinue
}
```

The process environment necessarily contains the plaintext credential while the
smoke test runs. Keep that PowerShell session local, short-lived, and
unrecorded.

Set only the non-secret opt-in values separately:

```powershell
$env:AI_PROVIDER = 'openai'
$env:OPENAI_MODEL = 'gpt-5-mini'
```

Use only a model explicitly approved for the smoke test. The repository example
is a placeholder, not a production model decision.

## Verify presence without revealing the value

Use the Boolean-only check:

```powershell
[bool]$env:OPENAI_API_KEY
```

Expected output is `True`. Never use a command that writes the environment
variable itself to the terminal. Do not capture the shell session, take a
screenshot, or paste terminal output into chat or GitHub.

## Deterministic local demo without a key

The deterministic workflow does not need a provider credential:

```powershell
Remove-Item Env:OPENAI_API_KEY -ErrorAction SilentlyContinue
$env:AI_PROVIDER = 'deterministic_stub'
docker compose up -d postgres
pnpm.cmd db:migrate
pnpm.cmd db:seed:workspace
pnpm.cmd db:seed:demo
pnpm.cmd db:seed:diagnostics
pnpm.cmd build
pnpm.cmd start
```

In another PowerShell session:

```powershell
pnpm.cmd verify:demo:e2e
```

Stop the temporary API process after verification.

## Run an authorized provider smoke test

Only after the database is migrated and seeded, the built API port is free, and
the three current-session variables are configured:

```powershell
pnpm.cmd smoke:provider:openai
```

The smoke script starts the existing API path, suppresses child output, validates
the controlled safety flags, and stops its temporary API. Do not rerun a FAIL
until its safe error status is reviewed. Do not copy raw responses into evidence.

## Remove the key immediately afterward

Remove all smoke-specific variables from the current session:

```powershell
Remove-Item Env:OPENAI_API_KEY -ErrorAction SilentlyContinue
Remove-Item Env:AI_PROVIDER -ErrorAction SilentlyContinue
Remove-Item Env:OPENAI_MODEL -ErrorAction SilentlyContinue
[bool]$env:OPENAI_API_KEY
```

Expected Boolean output is `False`. Close the PowerShell session after confirming
cleanup.

## Check the repository before and after

Run these checks before setting the key and again after removing it:

```powershell
git status --short
git diff --check
git diff
git diff --cached
pnpm.cmd repository:validate
```

Review `git diff` and `git diff --cached` locally for unexpected credential-like
content. Do not paste their contents into chat, an issue, or a pull request when
investigating a possible leak. The repository validator reports file-level
PASS/FAIL status without printing a matched secret value.

No `.env` file, log, screenshot, raw provider response, terminal transcript, or
generated artifact may be staged.

## Safe and forbidden evidence

Evidence may record:

- whether a key was present as `yes` or `no`;
- `PASS`, `SKIPPED`, `FAIL`, or `NOT EXECUTED`;
- provider name and approved model name;
- whether controlled validation and audit requirements passed;
- confirmation that no credential or raw response was recorded.

Evidence must never record:

- the key, any substring of it, or a key fingerprint;
- authorization headers or complete request headers;
- raw provider request or response bodies;
- terminal history, environment dumps, screenshots, or logs that may contain the
  key;
- account identifiers, billing data, or unrelated environment variables.

## Emergency response for accidental exposure

If a key is displayed, pasted, written to a file, staged, committed, pushed, or
included in any log:

1. Stop using it immediately.
2. Revoke or rotate it in the provider account before repository cleanup.
3. Remove it from the current PowerShell session.
4. Notify the repository owner/security contact through an approved private
   channel without repeating the key.
5. Identify every exposure location using filenames and commit identifiers only.
6. If the key is staged but uncommitted, unstage the affected file and remove the
   value locally.
7. If `.env` was accidentally tracked, remove it from the Git index while keeping
   the local file:

   ```powershell
   git rm --cached -- .env
   ```

8. If the key was committed or pushed, assume it remains recoverable from Git
   history. Coordinate history cleanup with the repository owner after rotation;
   deleting the visible line or making a follow-up commit is not sufficient.
9. Review provider usage/audit records for unauthorized activity.
10. Re-run repository validation and inspect staged filenames before any new
    commit.

Never delay rotation while attempting to rewrite Git history.

## Final reminder

A successful local provider smoke test proves one controlled connectivity path.
It does not prove model quality, production secret management, production
security, repair correctness, safety certification, or pilot readiness.
