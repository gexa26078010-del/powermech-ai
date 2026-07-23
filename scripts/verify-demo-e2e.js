#!/usr/bin/env node

const BASE_URL = 'http://localhost:3000';
const REQUEST_TIMEOUT_MS = 10000;

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const errorMessage = (error) => (error instanceof Error ? error.message : String(error));

async function requestJson(method, path, expectedStatus) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    let response;
    try {
      response = await fetch(`${BASE_URL}${path}`, {
        method,
        headers: { accept: 'application/json' },
        redirect: 'error',
        signal: controller.signal,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`request timed out after ${REQUEST_TIMEOUT_MS}ms`);
      }
      const causeCode =
        error instanceof Error &&
        error.cause &&
        typeof error.cause === 'object' &&
        'code' in error.cause
          ? ` (${String(error.cause.code)})`
          : '';
      throw new Error(`request failed${causeCode}: ${errorMessage(error)}`);
    }

    const responseText = await response.text();
    if (response.status !== expectedStatus) {
      const snippet = responseText.replace(/\s+/g, ' ').trim().slice(0, 160) || '<empty>';
      throw new Error(
        `expected HTTP ${expectedStatus}, received ${response.status}; body: ${snippet}`,
      );
    }

    let payload;
    try {
      payload = JSON.parse(responseText);
    } catch {
      throw new Error(`response is not valid JSON (HTTP ${response.status})`);
    }

    if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) {
      throw new Error('JSON response must be an object');
    }
    return payload;
  } finally {
    clearTimeout(timeout);
  }
}

const checks = [
  {
    method: 'GET',
    path: '/health',
    expectedStatus: 200,
    validate: (payload) => {
      assert(payload.status === 'ok', 'health.status must be ok');
      assert(payload.database === 'ok', 'health.database must be ok');
    },
  },
  {
    method: 'GET',
    path: '/demo/workspace',
    expectedStatus: 200,
    validate: (payload) => {
      assert(
        payload.workspace?.slug === 'demo-powersport-service',
        'workspace.slug must be demo-powersport-service',
      );
    },
  },
  {
    method: 'GET',
    path: '/demo/repair-case',
    expectedStatus: 200,
    validate: (payload) => {
      assert(
        payload.repairCase?.caseNumber === 'DEMO-RC-0001',
        'repairCase.caseNumber must be DEMO-RC-0001',
      );
      assert(
        payload.repairCase?.scenarioKey === 'starter_cranks_engine_no_start',
        'repairCase.scenarioKey must be starter_cranks_engine_no_start',
      );
      assert(
        payload.vehicle?.vehicleFamily === '1000cc_atv_model_family',
        'vehicle.vehicleFamily must be 1000cc_atv_model_family',
      );
    },
  },
  {
    method: 'GET',
    path: '/demo/diagnostic-context',
    expectedStatus: 200,
    validate: (payload) => {
      assert(Array.isArray(payload.diagnosticChecks), 'diagnosticChecks must be an array');
      const checkKeys = new Set(payload.diagnosticChecks.map((check) => check?.checkKey));
      for (const checkKey of [
        'battery_voltage_static',
        'fuel_pump_prime',
        'spark_presence',
      ]) {
        assert(checkKeys.has(checkKey), `diagnosticChecks must contain ${checkKey}`);
      }
    },
  },
  {
    method: 'POST',
    path: '/demo/repair-mentor/invoke',
    expectedStatus: 201,
    validate: (payload) => {
      assert(
        payload.invocation?.providerKey === 'deterministic_stub',
        'invocation.providerKey must be deterministic_stub',
      );
      assert(
        payload.invocation?.promptVersion === 'repair_mentor_first_scenario_v1',
        'invocation.promptVersion must be repair_mentor_first_scenario_v1',
      );
      assert(
        payload.invocation?.status === 'succeeded',
        'invocation.status must be succeeded',
      );
      assert(
        payload.repairMentor?.humanVerificationRequired === true,
        'repairMentor.humanVerificationRequired must be true',
      );
      assert(
        payload.repairMentor?.finalDiagnosisProvided === false,
        'repairMentor.finalDiagnosisProvided must be false',
      );
      assert(
        payload.repairMentor?.repairApprovalProvided === false,
        'repairMentor.repairApprovalProvided must be false',
      );
      assert(
        Array.isArray(payload.repairMentor?.nextChecks),
        'repairMentor.nextChecks must be an array',
      );
      const nextCheckKeys = new Set(
        payload.repairMentor.nextChecks.map((check) => check?.checkKey),
      );
      assert(
        nextCheckKeys.has('fuel_pump_prime_confirm'),
        'repairMentor.nextChecks must contain fuel_pump_prime_confirm',
      );
      assert(
        nextCheckKeys.has('spark_presence_check'),
        'repairMentor.nextChecks must contain spark_presence_check',
      );
      assert(
        payload.boundaries?.realProviderUsed === false,
        'boundaries.realProviderUsed must be false',
      );
      assert(
        payload.boundaries?.knowledgeRetrievalUsed === false,
        'boundaries.knowledgeRetrievalUsed must be false',
      );
      assert(
        payload.boundaries?.sharedKnowledgeImplemented === false,
        'boundaries.sharedKnowledgeImplemented must be false',
      );
      assert(
        payload.boundaries?.globalKnowledgeImplemented === false,
        'boundaries.globalKnowledgeImplemented must be false',
      );
    },
  },
];

async function verifyDemoE2e() {
  for (const check of checks) {
    try {
      const payload = await requestJson(check.method, check.path, check.expectedStatus);
      check.validate(payload);
      console.log(`PASS ${check.method} ${check.path}`);
    } catch (error) {
      console.error(`FAIL ${check.method} ${check.path}: ${errorMessage(error)}`);
      process.exitCode = 1;
      return;
    }
  }

  console.log(`PASS demo E2E verification completed (${checks.length}/${checks.length})`);
}

verifyDemoE2e().catch((error) => {
  console.error(`FAIL demo E2E verification: ${errorMessage(error)}`);
  process.exitCode = 1;
});
