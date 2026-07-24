# Next Steps After the Local MVP Demo

## Recommended next step

Use VS-008 or PR-043 for one narrow real AI-provider adapter through the existing AI Gateway contract.

The slice should remain a controlled technical validation:

1. Add one provider adapter behind the AI Gateway.
2. Keep provider credentials outside source control.
3. Run a manual, controlled prompt test using the canonical demo context.
4. Validate the provider response against a strict structured-output schema.
5. Log provider, model, prompt version, request metadata, response status, latency, and safe error details.
6. Preserve the rule that no result is returned before its audit record is persisted.
7. Fail closed on malformed, unsupported, or unsafe output.
8. Prohibit direct provider calls from Repair Mentor or controllers.

This step should prove the adapter boundary and controls. It should not claim model quality, production safety, or pilot readiness.

## Suggested acceptance boundary

A future real-provider slice is acceptable only if:

- The AI Gateway is the sole provider invocation path.
- The canonical diagnostic snapshot remains workspace and repair-case scoped.
- Structured output validation rejects extra or missing safety fields.
- Human verification remains required.
- Final diagnosis and repair approval remain prohibited.
- Provider errors and timeouts fail closed.
- Tests prove that direct provider bypass is absent.
- Logs do not contain credentials or unnecessary private data.

## Not recommended next

Do not build Knowledge Service, document ingestion, vector search, a broad frontend, Telegram/n8n automation, or production deployment before the provider boundary has been tested and the pilot scenario has been narrowed.

Those streams create more surface area without answering the next critical question: can one controlled external model call preserve the existing context, audit, validation, and human-review boundaries?

## Later sequence

After the provider adapter is reviewed:

1. Define a private Knowledge Service contract and governance model.
2. Add tightly scoped document ingestion with provenance and deletion rules.
3. Validate retrieval only inside an explicit workspace boundary.
4. Add a minimal UI for the agreed pilot workflow.
5. Address authentication, production authorization, deployment, observability, and operations before any real pilot.

Shared/global knowledge should remain later than private knowledge. It requires anonymization, verification, permission, provenance, conflict-resolution, and revocation rules.

## Risks and controls

| Risk | Control |
| --- | --- |
| Direct provider bypass creates inconsistent safety and logging | Make AI Gateway the only provider dependency and test the dependency graph |
| Model output looks structured but violates the contract | Validate a strict schema and reject unknown or missing fields |
| Prompt changes silently alter behavior | Version prompts and record the version per invocation |
| Provider timeout or outage produces partial guidance | Apply timeouts, return no guidance, and audit the failure |
| Credentials leak into source or logs | Use environment/secret storage and redact logs |
| Private repair data crosses an unintended boundary | Minimize payloads and review workspace scoping before each call |
| Demo output is mistaken for a diagnosis | Preserve explicit limitations and mandatory human verification |
| Early retrieval introduces unverified knowledge | Defer Knowledge Service until provenance and review rules exist |
| UI work masks backend uncertainty | Keep the next slice API-level and manually testable |

## CTO recommendation

Keep the next investment small and falsifiable. Prove one adapter, one prompt, one structured response, one audit path, and one human review loop. Stop and review the evidence before expanding into knowledge ingestion or user experience.
