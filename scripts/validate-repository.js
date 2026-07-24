#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const listFiles = (root) => {
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(root, entry.name);
    return entry.isDirectory() ? listFiles(entryPath) : [entryPath];
  });
};

const required = [
  'README.md', '.env.example', 'package.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml',
  'tsconfig.json', 'docker-compose.yml', 'apps/api/src/main.ts', 'apps/api/src/app.module.ts',
  'apps/api/src/config/database.config.ts', 'apps/api/src/db/database.module.ts',
  'apps/api/src/db/database.provider.ts', 'apps/api/src/health/health.controller.ts',
  'apps/api/src/health/health.service.ts', 'apps/api/src/health/health.module.ts',
  'apps/api/src/health/health.controller.spec.ts',
  'migrations/.gitkeep', 'scripts/validate-repository.js',
  '.github/workflows/repository-validation.yml', 'docs/implementation/vs-001-local-runtime.md',
  'evidence/vertical-slice/vs-001/01-baseline-and-commands.md',
  'evidence/vertical-slice/vs-001/02-environment.md',
  'evidence/vertical-slice/vs-001/03-postgres-and-migrations.md',
  'evidence/vertical-slice/vs-001/04-build-tests-runtime.md',
  'evidence/vertical-slice/vs-001/05-health-and-failure.md',
  'evidence/vertical-slice/vs-001/06-final-gate.md',
  'migrations/1700000000000_create_workspace_identity_boundary.js', 'scripts/seed-demo.js',
  'apps/api/src/demo/demo.module.ts', 'apps/api/src/demo/demo.controller.ts',
  'apps/api/src/demo/demo.service.ts', 'apps/api/src/demo/demo.types.ts',
  'apps/api/src/demo/demo.controller.spec.ts', 'apps/api/src/demo/demo.service.spec.ts',
  'docs/implementation/vs-002-demo-workspace-identity-seed.md',
  'evidence/vertical-slice/vs-002/01-scope-and-boundaries.md',
  'evidence/vertical-slice/vs-002/02-database-and-migrations.md',
  'evidence/vertical-slice/vs-002/03-demo-seed.md',
  'evidence/vertical-slice/vs-002/04-api-and-tests.md',
  'evidence/vertical-slice/vs-002/05-ci-and-validation.md',
  'evidence/vertical-slice/vs-002/06-final-gate.md',
  'migrations/1710000000000_create_vehicle_repair_case_seed_boundary.js',
  'scripts/seed-demo-repair-case.js',
  'docs/implementation/vs-003-vehicle-repair-case-seed.md',
  'evidence/vertical-slice/vs-003/01-scope-and-boundaries.md',
  'evidence/vertical-slice/vs-003/02-database-and-migrations.md',
  'evidence/vertical-slice/vs-003/03-demo-seed.md',
  'evidence/vertical-slice/vs-003/04-api-and-tests.md',
  'evidence/vertical-slice/vs-003/05-ci-and-validation.md',
  'evidence/vertical-slice/vs-003/06-final-gate.md',
  'migrations/1720000000000_create_diagnostic_context_boundary.js',
  'scripts/seed-demo-diagnostics.js',
  'docs/implementation/vs-004-diagnostic-context-recording.md',
  'evidence/vertical-slice/vs-004/01-scope-and-boundaries.md',
  'evidence/vertical-slice/vs-004/02-database-and-migrations.md',
  'evidence/vertical-slice/vs-004/03-demo-seed.md',
  'evidence/vertical-slice/vs-004/04-api-and-tests.md',
  'evidence/vertical-slice/vs-004/05-ci-and-validation.md',
  'evidence/vertical-slice/vs-004/06-final-gate.md',
  'migrations/1730000000000_create_ai_gateway_invocation_log.js',
  'apps/api/src/ai-gateway/ai-gateway.module.ts',
  'apps/api/src/ai-gateway/ai-gateway.service.ts',
  'apps/api/src/ai-gateway/ai-gateway.service.spec.ts',
  'apps/api/src/ai-gateway/ai-gateway.types.ts',
  'apps/api/src/ai-gateway/deterministic-stub.provider.ts',
  'apps/api/src/repair-mentor/repair-mentor.module.ts',
  'apps/api/src/repair-mentor/repair-mentor.controller.ts',
  'apps/api/src/repair-mentor/repair-mentor.controller.spec.ts',
  'apps/api/src/repair-mentor/repair-mentor.service.ts',
  'apps/api/src/repair-mentor/repair-mentor.service.spec.ts',
  'apps/api/src/repair-mentor/repair-mentor.types.ts',
  'docs/implementation/vs-005-controlled-repair-mentor-invocation.md',
  'evidence/vertical-slice/vs-005/01-scope-and-boundaries.md',
  'evidence/vertical-slice/vs-005/02-database-and-migrations.md',
  'evidence/vertical-slice/vs-005/03-ai-gateway-and-provider.md',
  'evidence/vertical-slice/vs-005/04-repair-mentor-api-and-tests.md',
  'evidence/vertical-slice/vs-005/05-ci-and-validation.md',
  'evidence/vertical-slice/vs-005/06-final-gate.md',
  'scripts/verify-demo-e2e.js',
  'docs/implementation/vs-006-e2e-demo-runtime-verification.md',
  'evidence/vertical-slice/vs-006/01-scope-and-boundaries.md',
  'evidence/vertical-slice/vs-006/02-runtime-and-environment.md',
  'evidence/vertical-slice/vs-006/03-migrations-and-seeds.md',
  'evidence/vertical-slice/vs-006/04-endpoints-and-e2e.md',
  'evidence/vertical-slice/vs-006/05-ci-and-validation.md',
  'evidence/vertical-slice/vs-006/06-final-gate.md',
  'docs/demo/mvp-local-demo-runbook.md',
  'docs/demo/mvp-demo-narrative.md',
  'docs/demo/mvp-api-examples.md',
  'docs/demo/pilot-readiness-checklist.md',
  'docs/demo/next-steps-after-local-demo.md',
  'evidence/vertical-slice/vs-007/01-scope-and-boundaries.md',
  'evidence/vertical-slice/vs-007/02-demo-runbook.md',
  'evidence/vertical-slice/vs-007/03-demo-narrative.md',
  'evidence/vertical-slice/vs-007/04-pilot-readiness.md',
  'evidence/vertical-slice/vs-007/05-ci-and-validation.md',
  'evidence/vertical-slice/vs-007/06-final-gate.md',
  'apps/api/src/ai-gateway/ai-provider.interface.ts',
  'apps/api/src/ai-gateway/ai-provider.selector.ts',
  'apps/api/src/ai-gateway/ai-provider.selector.spec.ts',
  'apps/api/src/ai-gateway/controlled-repair-mentor-output.validator.ts',
  'apps/api/src/ai-gateway/controlled-repair-mentor-output.validator.spec.ts',
  'apps/api/src/ai-gateway/openai.provider.ts',
  'apps/api/src/ai-gateway/openai.provider.spec.ts',
  'migrations/1740000000000_allow_controlled_ai_provider_keys.js',
  'docs/implementation/vs-008-controlled-ai-provider-adapter.md',
  'evidence/vertical-slice/vs-008/01-scope-and-boundaries.md',
  'evidence/vertical-slice/vs-008/02-provider-architecture.md',
  'evidence/vertical-slice/vs-008/03-configuration-and-secrets.md',
  'evidence/vertical-slice/vs-008/04-tests-and-validation.md',
  'evidence/vertical-slice/vs-008/05-ci-and-runtime.md',
  'evidence/vertical-slice/vs-008/06-final-gate.md',
  'scripts/run-migrations.js',
  'docs/implementation/db-migrate-fix.md',
  'evidence/db-migrate-fix/01-summary.md',
  'evidence/db-migrate-fix/02-verification.md',
  'evidence/db-migrate-fix/03-final-gate.md',
  'scripts/smoke-test-openai-provider.js',
  'apps/api/src/ai-gateway/smoke-test-openai-provider.spec.ts',
  'docs/implementation/vs-009-real-provider-smoke-test.md',
  'evidence/vertical-slice/vs-009/01-scope-and-boundaries.md',
  'evidence/vertical-slice/vs-009/02-runtime-configuration.md',
  'evidence/vertical-slice/vs-009/03-provider-smoke-test.md',
  'evidence/vertical-slice/vs-009/04-tests-and-validation.md',
  'evidence/vertical-slice/vs-009/05-security-and-secrets.md',
  'evidence/vertical-slice/vs-009/06-final-gate.md',
];

const forbiddenPaths = [
  'evidence/vs-001', 'evidence/vs-002', 'evidence/vs-003', 'evidence/vs-004',
  'evidence/vs-005', 'evidence/vs-006', 'evidence/vs-007', 'evidence/vs-008',
  'evidence/vs-009',
  'POWERMECH_AI_MASTER_AUDIT.md',
  'POWERMECH_AI_DECISION_LOG.md', 'POWERMECH_AI_IMPLEMENTATION_STATUS.md',
  'POWERMECH_AI_CTO_REVIEW_NOTES.md', 'src',
  'apps/api/src/knowledge', 'apps/api/src/knowledge-service',
  'apps/api/src/corporate-knowledge', 'apps/api/src/global-knowledge', 'apps/api/src/qdrant',
  'apps/api/src/embeddings', 'apps/api/src/vector-search', 'apps/api/src/vision',
  'apps/api/src/telegram', 'apps/api/src/n8n', 'apps/api/src/workspaces',
  'apps/api/src/users', 'apps/api/src/auth', 'apps/api/src/vehicles',
  'apps/api/src/repair-cases', 'apps/api/src/mechanic-observations',
  'apps/api/src/repair-steps', 'apps/api/src/parts', 'apps/api/src/inventory',
  'apps/api/src/work-orders', 'apps/api/src/invoices', 'apps/api/src/admin',
  'apps/api/src/analytics', 'apps/api/src/marketplace', 'apps/api/src/recommendations',
  'apps/api/src/final-diagnosis', 'apps/api/src/automated-conclusions',
  'apps/api/src/chat-history', 'apps/api/src/assistant-threads',
  'apps/api/src/training', 'apps/api/src/anonymization', 'apps/api/src/frontend',
];

const forbiddenDependencies = [
  '@anthropic-ai/sdk', '@nestjs/jwt', '@nestjs/passport', '@prisma/client', 'anthropic',
  '@qdrant/js-client-rest', 'axios', 'better-sqlite3', 'ioredis', 'jsonwebtoken', 'mikro-orm',
  'langchain', 'llamaindex', 'mongodb', 'mongoose', 'n8n', 'openai', 'passport',
  'prisma', 'qdrant', 'redis', 'sequelize', 'sqlite3', 'typeorm',
];

const forbiddenSourcePathTerms = [
  'repair-step', 'repair_step', 'knowledge', 'qdrant', 'embedding', 'vector', 'vision',
  'recommendation', 'final-diagnosis', 'final_diagnosis', 'automated-conclusion',
  'automated_conclusion', 'chat-history', 'chat_history', 'assistant-thread',
  'assistant_thread', 'training-dataset', 'training_dataset',
];

const forbiddenSourceSymbols = [
  'MechanicObservation', 'RepairStep', 'KnowledgeService', 'RecommendationService',
  'FinalDiagnosis', 'AutomatedConclusion', 'AssistantThread', 'TrainingDataset',
];

const forbiddenMigrationTables = [
  'diagnostics', 'measurements', 'mechanic_observations',
  'repair_steps', 'ai_invocations', 'knowledge_assets', 'knowledge_candidates',
  'verified_knowledge_assets', 'ai_results', 'repair_mentor_results',
  'repair_mentor_messages', 'chat_history', 'assistant_threads', 'training_examples',
  'training_datasets', 'recommendations', 'final_diagnoses', 'automated_conclusions',
  'parts', 'inventory', 'work_orders', 'invoices',
];

let failed = 0;
console.log('\nVS-001 through VS-009 Repository Validation\n');

for (const file of required) {
  const ok = fs.existsSync(file);
  console.log(`${ok ? 'PASS' : 'FAIL'} required file: ${file}`);
  if (!ok) failed++;
}

for (const forbiddenPath of forbiddenPaths) {
  const ok = !fs.existsSync(forbiddenPath);
  console.log(`${ok ? 'PASS' : 'FAIL'} forbidden path absent: ${forbiddenPath}`);
  if (!ok) failed++;
}

if (fs.existsSync('package.json')) {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredScripts = [
    'build', 'lint', 'test', 'repository:validate', 'db:migrate',
    'db:seed:workspace', 'db:seed:demo', 'db:seed:diagnostics', 'verify:demo:e2e',
  ];
  for (const script of requiredScripts) {
    const ok = typeof packageJson.scripts?.[script] === 'string';
    console.log(`${ok ? 'PASS' : 'FAIL'} required package script: ${script}`);
    if (!ok) failed++;
  }
  const e2eScriptOk =
    packageJson.scripts?.['verify:demo:e2e'] === 'node scripts/verify-demo-e2e.js';
  console.log(`${e2eScriptOk ? 'PASS' : 'FAIL'} exact package script: verify:demo:e2e`);
  if (!e2eScriptOk) failed++;
  const smokeScriptOk =
    packageJson.scripts?.['smoke:provider:openai'] ===
    'node scripts/smoke-test-openai-provider.js';
  console.log(`${smokeScriptOk ? 'PASS' : 'FAIL'} exact package script: smoke:provider:openai`);
  if (!smokeScriptOk) failed++;
  const exactMigrationScripts = {
    'db:migrate': 'node scripts/run-migrations.js up',
    'db:migrate:down': 'node scripts/run-migrations.js down',
    'db:reset': 'node scripts/run-migrations.js reset',
  };
  for (const [script, expected] of Object.entries(exactMigrationScripts)) {
    const ok = packageJson.scripts?.[script] === expected;
    console.log(`${ok ? 'PASS' : 'FAIL'} exact package script: ${script}`);
    if (!ok) failed++;
  }
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  for (const dependency of forbiddenDependencies) {
    const ok = !(dependency in dependencies);
    console.log(`${ok ? 'PASS' : 'FAIL'} forbidden dependency absent: ${dependency}`);
    if (!ok) failed++;
  }
  const forbiddenDependencyTerms = [
    'openai', 'anthropic', 'langchain', 'llamaindex', 'qdrant',
    'prisma', 'typeorm', 'sequelize', 'mikro-orm',
  ];
  for (const term of forbiddenDependencyTerms) {
    const matches = Object.keys(dependencies).filter((dependency) =>
      dependency.toLowerCase().includes(term),
    );
    const ok = matches.length === 0;
    console.log(`${ok ? 'PASS' : 'FAIL'} forbidden dependency family absent: ${term}`);
    if (!ok) failed++;
  }
}

if (fs.existsSync('scripts/smoke-test-openai-provider.js')) {
  const smokeSource = fs.readFileSync('scripts/smoke-test-openai-provider.js', 'utf8');
  const requiredSmokeFragments = [
    'process.env.OPENAI_API_KEY',
    'process.env.AI_PROVIDER',
    'process.env.OPENAI_MODEL',
    'SKIPPED OpenAI provider smoke test',
    '/demo/repair-mentor/invoke',
    "invocation.providerKey === 'openai'",
    'humanVerificationRequired === true',
    'finalDiagnosisProvided === false',
    'repairApprovalProvided === false',
    "shell: false",
    "stdio: 'ignore'",
  ];
  for (const fragment of requiredSmokeFragments) {
    const ok = smokeSource.includes(fragment);
    console.log(`${ok ? 'PASS' : 'FAIL'} provider smoke guardrail present: ${fragment}`);
    if (!ok) failed++;
  }
  const noDirectProviderCall = !/api\.(?:openai|anthropic)\.com/i.test(smokeSource);
  console.log(`${noDirectProviderCall ? 'PASS' : 'FAIL'} provider smoke uses no direct provider endpoint`);
  if (!noDirectProviderCall) failed++;
  const noDirectProviderImport =
    !/\b(?:OpenAiProvider|ClaudeProvider)\b/.test(smokeSource);
  console.log(`${noDirectProviderImport ? 'PASS' : 'FAIL'} provider smoke imports no provider adapter`);
  if (!noDirectProviderImport) failed++;
}

if (fs.existsSync('scripts/run-migrations.js')) {
  const migrationRunnerSource = fs.readFileSync('scripts/run-migrations.js', 'utf8');
  const requiredMigrationRunnerFragments = [
    'DB_HOST',
    'DB_PORT',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME',
    'DATABASE_URL',
    "require.resolve('node-pg-migrate/bin/node-pg-migrate')",
    "shell: false",
  ];
  for (const fragment of requiredMigrationRunnerFragments) {
    const ok = migrationRunnerSource.includes(fragment);
    console.log(`${ok ? 'PASS' : 'FAIL'} migration runner contract present: ${fragment}`);
    if (!ok) failed++;
  }
  const noSecretOutput =
    !/console\.(?:log|info|warn|error)\s*\([^)]*(?:databaseUrl|password)/i.test(
      migrationRunnerSource,
    );
  console.log(`${noSecretOutput ? 'PASS' : 'FAIL'} migration runner does not print credentials`);
  if (!noSecretOutput) failed++;
}

if (fs.existsSync('scripts/verify-demo-e2e.js')) {
  const e2eSource = fs.readFileSync('scripts/verify-demo-e2e.js', 'utf8');
  const requiredE2eFragments = [
    'http://localhost:3000',
    '/health',
    '/demo/workspace',
    '/demo/repair-case',
    '/demo/diagnostic-context',
    '/demo/repair-mentor/invoke',
    'deterministic_stub',
    'repair_mentor_first_scenario_v1',
  ];
  for (const fragment of requiredE2eFragments) {
    const ok = e2eSource.includes(fragment);
    console.log(`${ok ? 'PASS' : 'FAIL'} E2E verifier contract present: ${fragment}`);
    if (!ok) failed++;
  }
  const urls = e2eSource.match(/https?:\/\/[^\s'"]+/g) ?? [];
  const localOnly = urls.every((url) => url.startsWith('http://localhost:3000'));
  console.log(`${localOnly ? 'PASS' : 'FAIL'} E2E verifier uses local HTTP only`);
  if (!localOnly) failed++;
  const nativeFetch = /\bfetch\s*\(/.test(e2eSource) && !/\baxios\b/i.test(e2eSource);
  console.log(`${nativeFetch ? 'PASS' : 'FAIL'} E2E verifier uses native fetch without axios`);
  if (!nativeFetch) failed++;
}

const allowedVs005SourceFiles = new Set([
  'apps/api/src/ai-gateway/ai-gateway.module.ts',
  'apps/api/src/ai-gateway/ai-gateway.service.ts',
  'apps/api/src/ai-gateway/ai-gateway.service.spec.ts',
  'apps/api/src/ai-gateway/ai-gateway.types.ts',
  'apps/api/src/ai-gateway/deterministic-stub.provider.ts',
  'apps/api/src/repair-mentor/repair-mentor.module.ts',
  'apps/api/src/repair-mentor/repair-mentor.controller.ts',
  'apps/api/src/repair-mentor/repair-mentor.controller.spec.ts',
  'apps/api/src/repair-mentor/repair-mentor.service.ts',
  'apps/api/src/repair-mentor/repair-mentor.service.spec.ts',
  'apps/api/src/repair-mentor/repair-mentor.types.ts',
  'apps/api/src/ai-gateway/ai-provider.interface.ts',
  'apps/api/src/ai-gateway/ai-provider.selector.ts',
  'apps/api/src/ai-gateway/ai-provider.selector.spec.ts',
  'apps/api/src/ai-gateway/controlled-repair-mentor-output.validator.ts',
  'apps/api/src/ai-gateway/controlled-repair-mentor-output.validator.spec.ts',
  'apps/api/src/ai-gateway/openai.provider.ts',
  'apps/api/src/ai-gateway/openai.provider.spec.ts',
  'apps/api/src/ai-gateway/smoke-test-openai-provider.spec.ts',
]);
const actualVs005SourceFiles = [
  ...listFiles('apps/api/src/ai-gateway'),
  ...listFiles('apps/api/src/repair-mentor'),
].map((file) => path.relative('.', file).split(path.sep).join('/'));
for (const file of actualVs005SourceFiles) {
  const ok = allowedVs005SourceFiles.has(file);
  console.log(`${ok ? 'PASS' : 'FAIL'} exact VS-005 source file allowed: ${file}`);
  if (!ok) failed++;
}

const sourceFiles = listFiles('apps/api/src').filter((file) => file.endsWith('.ts'));
for (const file of sourceFiles) {
  const sourcePath = path.relative('.', file).split(path.sep).join('/').toLowerCase();
  const forbiddenTerm = forbiddenSourcePathTerms.find((term) => sourcePath.includes(term));
  const pathOk = !forbiddenTerm;
  console.log(`${pathOk ? 'PASS' : 'FAIL'} forbidden source path absent: ${sourcePath}`);
  if (!pathOk) failed++;

  const source = fs.readFileSync(file, 'utf8');
  const symbolPattern = new RegExp(`\\b(?:class|interface|type|function)\\s+(?:${forbiddenSourceSymbols.join('|')})\\b`);
  const symbolsOk = !symbolPattern.test(source);
  console.log(`${symbolsOk ? 'PASS' : 'FAIL'} forbidden source symbol absent: ${sourcePath}`);
  if (!symbolsOk) failed++;
}

const combinedSource = sourceFiles.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
const forbiddenProviderPatterns = [
  {
    label: 'real provider SDK import',
    pattern: /(?:from\s+['"](?:openai|anthropic|@anthropic-ai\/sdk|langchain|llamaindex)['"]|require\(\s*['"](?:openai|anthropic|@anthropic-ai\/sdk|langchain|llamaindex)['"]\s*\))/i,
  },
  {
    label: 'Claude provider implementation',
    pattern: /\b(?:ANTHROPIC_API_KEY|CLAUDE_API_KEY|api\.anthropic\.com)\b/i,
  },
];
for (const { label, pattern } of forbiddenProviderPatterns) {
  const ok = !pattern.test(combinedSource);
  console.log(`${ok ? 'PASS' : 'FAIL'} forbidden implementation absent: ${label}`);
  if (!ok) failed++;
}

if (fs.existsSync('apps/api/src/ai-gateway/openai.provider.ts')) {
  const openAiSource = fs.readFileSync(
    'apps/api/src/ai-gateway/openai.provider.ts',
    'utf8',
  );
  const requiredOpenAiFragments = [
    'https://api.openai.com/v1/responses',
    'OPENAI_API_KEY',
    'OPENAI_MODEL',
    'store: false',
    "type: 'json_schema'",
    'strict: true',
    'AbortController',
  ];
  for (const fragment of requiredOpenAiFragments) {
    const ok = openAiSource.includes(fragment);
    console.log(`${ok ? 'PASS' : 'FAIL'} controlled OpenAI adapter contract present: ${fragment}`);
    if (!ok) failed++;
  }
  const nativeFetch =
    /\bfetch\s*\(/.test(openAiSource) &&
    !/\baxios\b/i.test(openAiSource) &&
    !/(?:from\s+['"]openai['"]|require\(\s*['"]openai['"]\s*\))/i.test(openAiSource);
  console.log(`${nativeFetch ? 'PASS' : 'FAIL'} OpenAI adapter uses native fetch without SDK`);
  if (!nativeFetch) failed++;
}

const repairMentorSource = listFiles('apps/api/src/repair-mentor')
  .filter((file) => file.endsWith('.ts'))
  .map((file) => fs.readFileSync(file, 'utf8'))
  .join('\n');
const repairMentorProviderBypassPatterns = [
  { label: 'native provider fetch', pattern: /\bfetch\s*\(/i },
  { label: 'provider API endpoint', pattern: /api\.(?:openai|anthropic)\.com/i },
  { label: 'provider credential', pattern: /\b(?:OPENAI_API_KEY|ANTHROPIC_API_KEY|CLAUDE_API_KEY)\b/i },
  { label: 'direct OpenAI adapter import', pattern: /openai\.provider/i },
  { label: 'direct Claude adapter', pattern: /\b(?:Anthropic|Claude)Provider\b/i },
];
for (const { label, pattern } of repairMentorProviderBypassPatterns) {
  const ok = !pattern.test(repairMentorSource);
  console.log(`${ok ? 'PASS' : 'FAIL'} Repair Mentor provider bypass absent: ${label}`);
  if (!ok) failed++;
}

if (fs.existsSync('.env.example')) {
  const envExample = fs.readFileSync('.env.example', 'utf8');
  const deterministicDefault = /^AI_PROVIDER=deterministic_stub$/m.test(envExample);
  console.log(`${deterministicDefault ? 'PASS' : 'FAIL'} deterministic_stub is the documented default`);
  if (!deterministicDefault) failed++;

  const emptyOpenAiKey = /^OPENAI_API_KEY=$/m.test(envExample);
  console.log(`${emptyOpenAiKey ? 'PASS' : 'FAIL'} OpenAI key example is empty`);
  if (!emptyOpenAiKey) failed++;

  const documentedModel = /^OPENAI_MODEL=[A-Za-z0-9._-]+$/m.test(envExample);
  console.log(`${documentedModel ? 'PASS' : 'FAIL'} OpenAI model placeholder is documented`);
  if (!documentedModel) failed++;
}

if (fs.existsSync('migrations/1740000000000_allow_controlled_ai_provider_keys.js')) {
  const providerMigration = fs.readFileSync(
    'migrations/1740000000000_allow_controlled_ai_provider_keys.js',
    'utf8',
  );
  for (const providerKey of ['deterministic_stub', 'openai', 'invalid_configuration']) {
    const ok = providerMigration.includes(providerKey);
    console.log(`${ok ? 'PASS' : 'FAIL'} controlled audit provider key present: ${providerKey}`);
    if (!ok) failed++;
  }
}

const secretScanFiles = [
  '.env.example',
  ...sourceFiles,
  'docs/implementation/vs-008-controlled-ai-provider-adapter.md',
  ...listFiles('evidence/vertical-slice/vs-008'),
  'scripts/smoke-test-openai-provider.js',
  'docs/implementation/vs-009-real-provider-smoke-test.md',
  ...listFiles('evidence/vertical-slice/vs-009'),
].filter((file) => fs.existsSync(file));
const secretLookingPatterns = [
  /\bsk-[A-Za-z0-9_-]{20,}\b/,
  /\b(?:OPENAI_API_KEY|ANTHROPIC_API_KEY|CLAUDE_API_KEY)\s*=\s*['"]?[A-Za-z0-9_-]{20,}/,
];
for (const file of secretScanFiles) {
  const source = fs.readFileSync(file, 'utf8');
  const ok = secretLookingPatterns.every((pattern) => !pattern.test(source));
  console.log(`${ok ? 'PASS' : 'FAIL'} secret-looking provider value absent: ${file}`);
  if (!ok) failed++;
}

const migrationSource = listFiles('migrations')
  .filter((file) => file.endsWith('.js') || file.endsWith('.sql'))
  .map((file) => fs.readFileSync(file, 'utf8'))
  .join('\n');
for (const table of forbiddenMigrationTables) {
  const tablePattern = new RegExp(`(?:createTable\\(\\s*['\"]${table}['\"]|CREATE\\s+TABLE\\s+(?:IF\\s+NOT\\s+EXISTS\\s+)?(?:\"?\\w+\"?\\.)?\"?${table}\"?)`, 'i');
  const ok = !tablePattern.test(migrationSource);
  console.log(`${ok ? 'PASS' : 'FAIL'} forbidden migration table absent: ${table}`);
  if (!ok) failed++;
}

if (fs.existsSync('pnpm-lock.yaml')) {
  const ok = !/placeholder/i.test(fs.readFileSync('pnpm-lock.yaml', 'utf8'));
  console.log(`${ok ? 'PASS' : 'FAIL'} pnpm-lock.yaml is not placeholder`);
  if (!ok) failed++;
}

console.log(`\nValidation result: ${failed === 0 ? 'PASS' : 'FAIL'}\n`);
process.exit(failed === 0 ? 0 : 1);
