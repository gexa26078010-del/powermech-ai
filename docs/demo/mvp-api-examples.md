# PowerMech AI MVP API Examples

## How to read these examples

The following are representative, source-backed examples based on the current service mappings and automated tests. They describe the canonical seeded scenario; they were not invented as a future contract. Dynamic values such as `timestamp` and `latencyMs` vary between runs.

Start PostgreSQL, migrate, seed, and start the API as described in [the local demo runbook](mvp-local-demo-runbook.md).

## `GET /health`

Request:

```powershell
Invoke-RestMethod http://localhost:3000/health
```

Representative HTTP `200` response:

```json
{
  "status": "ok",
  "database": "ok",
  "timestamp": "2026-01-01T00:00:00.000Z",
  "version": "0.1.0",
  "latencyMs": 1
}
```

Meaning:

- `status: "ok"` and `database: "ok"` mean the API completed its PostgreSQL health query.
- `timestamp` is generated for the check.
- `latencyMs` is measured locally and will vary.
- This is a liveness/dependency check, not a production-readiness result.

## `GET /demo/workspace`

Request:

```powershell
Invoke-RestMethod http://localhost:3000/demo/workspace
```

Representative HTTP `200` response:

```json
{
  "workspace": {
    "slug": "demo-powersport-service",
    "name": "Demo Powersport Service",
    "status": "active"
  },
  "owner": {
    "email": "owner@demo.powermech.local",
    "displayName": "Demo Owner"
  },
  "membership": {
    "role": "owner"
  },
  "boundaries": {
    "privateWorkspace": true,
    "sharedKnowledgeImplemented": false,
    "globalKnowledgeImplemented": false
  }
}
```

Meaning:

This proves the deterministic demo workspace, owner identity, and membership can be read together. `privateWorkspace` describes the data boundary. It does not mean production authentication or authorization is implemented.

## `GET /demo/repair-case`

Request:

```powershell
Invoke-RestMethod http://localhost:3000/demo/repair-case
```

Representative HTTP `200` response:

```json
{
  "workspace": {
    "slug": "demo-powersport-service",
    "name": "Demo Powersport Service"
  },
  "vehicle": {
    "brand": "Demo Powersport",
    "model": "Demo 1000 ATV",
    "modelYear": 2024,
    "vehicleFamily": "1000cc_atv_model_family",
    "vin": "DEMOATV1000000001"
  },
  "repairCase": {
    "caseNumber": "DEMO-RC-0001",
    "customerComplaint": "Starter cranks, engine does not start",
    "status": "open",
    "scenarioKey": "starter_cranks_engine_no_start"
  },
  "boundaries": {
    "workspaceScoped": true,
    "diagnosticsImplemented": false,
    "repairMentorImplemented": false,
    "sharedKnowledgeImplemented": false,
    "globalKnowledgeImplemented": false
  }
}
```

Meaning:

This proves the canonical vehicle and repair case are associated with the demo workspace. The `boundaries` values are the preserved response contract from the repair-case slice; they should not be interpreted as a current inventory of separate endpoints. Diagnostic context and Repair Mentor are demonstrated through their own endpoints below.

## `GET /demo/diagnostic-context`

Request:

```powershell
Invoke-RestMethod http://localhost:3000/demo/diagnostic-context
```

Representative HTTP `200` response:

```json
{
  "workspace": {
    "slug": "demo-powersport-service"
  },
  "repairCase": {
    "caseNumber": "DEMO-RC-0001",
    "scenarioKey": "starter_cranks_engine_no_start",
    "customerComplaint": "Starter cranks, engine does not start"
  },
  "diagnosticChecks": [
    {
      "checkKey": "battery_voltage_static",
      "title": "Battery voltage static check",
      "status": "recorded",
      "result": "pass",
      "mechanicNote": "Static battery voltage is within acceptable demo range.",
      "measurements": [
        {
          "measurementKey": "battery_voltage",
          "label": "Battery voltage",
          "valueNumeric": 12.6,
          "valueText": null,
          "unit": "V"
        }
      ]
    },
    {
      "checkKey": "fuel_pump_prime",
      "title": "Fuel pump prime sound check",
      "status": "recorded",
      "result": "unknown",
      "mechanicNote": "Fuel pump prime sound not confirmed in demo seed.",
      "measurements": [
        {
          "measurementKey": "fuel_pump_prime_observation",
          "label": "Fuel pump prime observation",
          "valueNumeric": null,
          "valueText": "Not confirmed",
          "unit": null
        }
      ]
    },
    {
      "checkKey": "spark_presence",
      "title": "Spark presence check",
      "status": "recorded",
      "result": "not_checked",
      "mechanicNote": "Spark presence has not been checked yet in demo seed.",
      "measurements": []
    }
  ],
  "boundaries": {
    "workspaceScoped": true,
    "repairCaseScoped": true,
    "aiImplemented": false,
    "repairMentorImplemented": false,
    "sharedKnowledgeImplemented": false,
    "globalKnowledgeImplemented": false
  }
}
```

Meaning:

This response preserves facts, unknowns, and not-yet-checked states rather than manufacturing a conclusion. Checks and nested measurements are deterministic and ordered. The boundary flags are preserved from the diagnostic-context slice; the controlled Repair Mentor is invoked separately.

## `POST /demo/repair-mentor/invoke`

Request:

```powershell
Invoke-RestMethod -Method Post http://localhost:3000/demo/repair-mentor/invoke
```

Representative HTTP `201` response:

```json
{
  "workspace": {
    "slug": "demo-powersport-service"
  },
  "repairCase": {
    "caseNumber": "DEMO-RC-0001",
    "scenarioKey": "starter_cranks_engine_no_start",
    "customerComplaint": "Starter cranks, engine does not start"
  },
  "invocation": {
    "providerKey": "deterministic_stub",
    "promptVersion": "repair_mentor_first_scenario_v1",
    "invocationType": "repair_mentor_first_scenario",
    "status": "succeeded"
  },
  "repairMentor": {
    "summary": "Battery voltage is acceptable in the demo diagnostic context. Fuel pump prime is not confirmed and spark presence has not been checked.",
    "nextChecks": [
      {
        "checkKey": "fuel_pump_prime_confirm",
        "title": "Confirm fuel pump prime",
        "reason": "Fuel pump prime is unknown in the recorded diagnostic context.",
        "priority": 1
      },
      {
        "checkKey": "spark_presence_check",
        "title": "Check spark presence",
        "reason": "Spark presence has not been checked yet.",
        "priority": 2
      }
    ],
    "safetyWarnings": [
      "Do not bypass safety procedures.",
      "Human mechanic verification is required before any repair decision."
    ],
    "limitations": [
      "This is controlled demo guidance, not a final diagnosis.",
      "No parts replacement decision is made by the system."
    ],
    "humanVerificationRequired": true,
    "finalDiagnosisProvided": false,
    "repairApprovalProvided": false
  },
  "boundaries": {
    "workspaceScoped": true,
    "repairCaseScoped": true,
    "diagnosticContextUsed": true,
    "realProviderUsed": false,
    "knowledgeRetrievalUsed": false,
    "finalDiagnosisProvided": false,
    "repairApprovalProvided": false,
    "sharedKnowledgeImplemented": false,
    "globalKnowledgeImplemented": false
  }
}
```

Meaning:

The controlled invocation used the recorded context, passed through the AI Gateway contract, and was logged before the response was returned. `deterministic_stub` means no real provider was called. The output proposes next checks only; human verification remains mandatory.
