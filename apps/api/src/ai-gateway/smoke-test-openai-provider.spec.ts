import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const scriptPath = path.resolve(
  process.cwd(),
  'scripts',
  'smoke-test-openai-provider.js',
);

const cleanEnvironment = (): NodeJS.ProcessEnv => {
  const environment = { ...process.env };
  delete environment.OPENAI_API_KEY;
  delete environment.OPENAI_MODEL;
  delete environment.AI_PROVIDER;
  return environment;
};

describe('OpenAI provider smoke-test guardrails', () => {
  it('skips safely without a provider key and exits successfully', () => {
    const environment = cleanEnvironment();
    environment.AI_PROVIDER = 'openai';
    environment.OPENAI_MODEL = 'gpt-5-mini';
    const result = spawnSync(process.execPath, [scriptPath], {
      encoding: 'utf8',
      env: environment,
      timeout: 5000,
    });

    expect(result.error).toBeUndefined();
    expect(result.status).toBe(0);
    expect(result.stdout.trim()).toBe(
      'SKIPPED OpenAI provider smoke test: OPENAI_API_KEY is not present in process.env.',
    );
    expect(result.stderr).toBe('');
  });

  it('requires explicit openai opt-in before starting any runtime', () => {
    const environment = cleanEnvironment();
    environment.OPENAI_API_KEY = 'test-key';
    environment.OPENAI_MODEL = 'gpt-5-mini';

    const result = spawnSync(process.execPath, [scriptPath], {
      encoding: 'utf8',
      env: environment,
      timeout: 5000,
    });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('AI_PROVIDER must be openai');
    expect(`${result.stdout}${result.stderr}`).not.toContain(
      environment.OPENAI_API_KEY,
    );
  });

  it('uses only the existing local Repair Mentor path and safety flags', () => {
    const source = fs.readFileSync(scriptPath, 'utf8');

    expect(source).toContain('/demo/repair-mentor/invoke');
    expect(source).toContain("invocation.providerKey === 'openai'");
    expect(source).toContain('humanVerificationRequired === true');
    expect(source).toContain('finalDiagnosisProvided === false');
    expect(source).toContain('repairApprovalProvided === false');
    expect(source).not.toMatch(/api\.openai\.com|api\.anthropic\.com/i);
    expect(source).not.toMatch(/\b(?:OpenAiProvider|ClaudeProvider)\b/);
  });
});
