# VS-008 Evidence: 02 - Provider Architecture

## Flow

```text
RepairMentorService
  -> AiGatewayService
    -> AiProviderSelector
      -> DeterministicStubProvider (default)
      -> OpenAiProvider (opt-in)
    -> validateControlledRepairMentorOutput
    -> ai_gateway_invocations
```

## Interface

`AiGatewayProvider` exposes only provider identity, whether it is real, and one `invokeRepairMentor` operation. It cannot add chat, memory, retrieval, or a new endpoint.

## Selection

`AiProviderSelector` defaults to `deterministic_stub`. OpenAI is selected only by `AI_PROVIDER=openai` with both a non-empty key and model. Unsupported or incomplete configuration throws a typed safe error that AI Gateway audits as failed.

There is no automatic fallback after an explicit OpenAI selection.

## Transport

`OpenAiProvider` uses native `fetch` and the fixed OpenAI Responses API HTTPS endpoint. It sets a 15-second timeout, disables response storage, sends a fixed instruction and structured snapshot, does not stream, and exposes no arbitrary provider URL.

No OpenAI SDK or other provider dependency is added.

## Validation

The API request supplies a strict JSON Schema. After transport parsing, AI Gateway applies a separate exact-key runtime validator. Unsafe flags, extra fields, malformed next checks, or unbounded/empty content are rejected and audited.

## Response mapping

Repair Mentor receives only `AiGatewayInvocationSuccess`. It exposes `realProviderUsed` from the gateway result; the value is true only for a successful validated real-provider invocation.
