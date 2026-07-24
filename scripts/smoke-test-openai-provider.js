#!/usr/bin/env node
const fs = require('fs');
const net = require('net');
const path = require('path');
const { once } = require('events');
const { spawn } = require('child_process');

const STARTUP_TIMEOUT_MS = 20000;
const REQUEST_TIMEOUT_MS = 25000;

class SmokeTestError extends Error {}

const delay = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

const isRecord = (value) =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const getPort = () => {
  const value = process.env.PORT ?? '3000';
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new SmokeTestError('PORT must be an integer between 1 and 65535.');
  }
  return port;
};

const getSmokeConfiguration = () => {
  const apiKeyPresent =
    typeof process.env.OPENAI_API_KEY === 'string' &&
    process.env.OPENAI_API_KEY.trim().length > 0;
  if (!apiKeyPresent) return null;

  if (process.env.AI_PROVIDER?.trim() !== 'openai') {
    throw new SmokeTestError('AI_PROVIDER must be openai when a provider key is present.');
  }

  const model = process.env.OPENAI_MODEL?.trim();
  if (!model || !/^[A-Za-z0-9._-]{1,100}$/.test(model)) {
    throw new SmokeTestError('OPENAI_MODEL must be a safe non-empty model name.');
  }

  return { model, port: getPort() };
};

const ensurePortAvailable = (port) =>
  new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.once('error', () => {
      reject(new SmokeTestError(`Local port ${port} must be available for the smoke test.`));
    });
    server.listen({ host: '127.0.0.1', port, exclusive: true }, () => {
      server.close((error) => {
        if (error) {
          reject(new SmokeTestError('Unable to release the smoke-test port check.'));
          return;
        }
        resolve();
      });
    });
  });

const fetchWithTimeout = async (url, init, timeoutMilliseconds) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMilliseconds);
  try {
    return await fetch(url, { ...init, redirect: 'error', signal: controller.signal });
  } catch {
    throw new SmokeTestError('Local smoke-test request failed or timed out.');
  } finally {
    clearTimeout(timeout);
  }
};

const waitForApi = async (apiProcess, baseUrl) => {
  const deadline = Date.now() + STARTUP_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (apiProcess.exitCode !== null || apiProcess.signalCode !== null) {
      throw new SmokeTestError('Temporary API exited before becoming ready.');
    }
    try {
      const response = await fetchWithTimeout(
        `${baseUrl}/health`,
        { method: 'GET', headers: { accept: 'application/json' } },
        1000,
      );
      if (response.status === 200) return;
    } catch {
      // Readiness retries intentionally expose no API response or process output.
    }
    await delay(250);
  }
  throw new SmokeTestError('Temporary API did not become ready in time.');
};

const invokeExistingGatewayPath = async (baseUrl) => {
  const response = await fetchWithTimeout(
    `${baseUrl}/demo/repair-mentor/invoke`,
    { method: 'POST', headers: { accept: 'application/json' } },
    REQUEST_TIMEOUT_MS,
  );
  if (response.status !== 201) {
    throw new SmokeTestError(
      `Existing Repair Mentor endpoint returned controlled HTTP ${response.status}.`,
    );
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new SmokeTestError('Existing Repair Mentor endpoint returned invalid JSON.');
  }

  const invocation = isRecord(payload) ? payload.invocation : null;
  const repairMentor = isRecord(payload) ? payload.repairMentor : null;
  const boundaries = isRecord(payload) ? payload.boundaries : null;
  const valid =
    isRecord(invocation) &&
    invocation.providerKey === 'openai' &&
    invocation.status === 'succeeded' &&
    isRecord(repairMentor) &&
    Array.isArray(repairMentor.nextChecks) &&
    repairMentor.nextChecks.length > 0 &&
    repairMentor.humanVerificationRequired === true &&
    repairMentor.finalDiagnosisProvided === false &&
    repairMentor.repairApprovalProvided === false &&
    isRecord(boundaries) &&
    boundaries.realProviderUsed === true &&
    boundaries.finalDiagnosisProvided === false &&
    boundaries.repairApprovalProvided === false;

  if (!valid) {
    throw new SmokeTestError('Provider result failed smoke-test safety validation.');
  }
};

const stopApi = async (apiProcess) => {
  if (apiProcess.exitCode !== null || apiProcess.signalCode !== null) return;
  const exited = once(apiProcess, 'exit');
  apiProcess.kill();
  await Promise.race([exited, delay(3000)]);
  if (apiProcess.exitCode === null && apiProcess.signalCode === null) {
    apiProcess.kill('SIGKILL');
    await Promise.race([once(apiProcess, 'exit'), delay(3000)]);
  }
};

const run = async () => {
  const configuration = getSmokeConfiguration();
  if (!configuration) {
    console.log(
      'SKIPPED OpenAI provider smoke test: OPENAI_API_KEY is not present in process.env.',
    );
    return;
  }

  const repositoryRoot = path.resolve(__dirname, '..');
  const apiEntrypoint = path.join(repositoryRoot, 'dist', 'main.js');
  if (!fs.existsSync(apiEntrypoint)) {
    throw new SmokeTestError('Built API entrypoint is missing; run pnpm.cmd build first.');
  }

  await ensurePortAvailable(configuration.port);
  const apiProcess = spawn(process.execPath, [apiEntrypoint], {
    cwd: repositoryRoot,
    env: { ...process.env },
    shell: false,
    stdio: 'ignore',
    windowsHide: true,
  });

  try {
    const baseUrl = `http://127.0.0.1:${configuration.port}`;
    await waitForApi(apiProcess, baseUrl);
    await invokeExistingGatewayPath(baseUrl);
    console.log(
      `PASS provider=openai model=${configuration.model} validation=passed audit=required`,
    );
  } finally {
    await stopApi(apiProcess);
  }
};

run().catch((error) => {
  const message =
    error instanceof SmokeTestError
      ? error.message
      : 'Unexpected controlled smoke-test failure.';
  console.error(`FAIL OpenAI provider smoke test: ${message}`);
  process.exitCode = 1;
});
