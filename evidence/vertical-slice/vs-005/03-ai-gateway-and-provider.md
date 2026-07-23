# AI Gateway and provider

- AI Gateway provider: `deterministic_stub`.
- Prompt version: `repair_mentor_first_scenario_v1`.
- Invocation type: `repair_mentor_first_scenario`.
- The provider reads the sorted recorded diagnostic snapshot and supports only the canonical first-scenario state.
- Unsupported diagnostic context fails closed and is recorded with `status = failed`.
- The response contains structured next checks, safety warnings, limitations, and mandatory human verification.
- AI Gateway owns success/failure audit persistence; it cannot return guidance until the success row is stored.
- Tests verify exact identity/check-set rejection, succeeded/failed audit payloads, and failure when audit storage is unavailable.
- No external SDK, API request, provider credential, streaming, chat history, or knowledge retrieval exists.
- Real OpenAI and Claude providers are not implemented.
