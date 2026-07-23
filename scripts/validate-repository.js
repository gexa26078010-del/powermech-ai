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
];

const forbiddenPaths = [
  'evidence/vs-001', 'evidence/vs-002', 'evidence/vs-003', 'evidence/vs-004',
  'POWERMECH_AI_MASTER_AUDIT.md',
  'POWERMECH_AI_DECISION_LOG.md', 'POWERMECH_AI_IMPLEMENTATION_STATUS.md',
  'POWERMECH_AI_CTO_REVIEW_NOTES.md', 'src', 'apps/api/src/repair-mentor',
  'apps/api/src/ai-gateway', 'apps/api/src/knowledge', 'apps/api/src/knowledge-service',
  'apps/api/src/corporate-knowledge', 'apps/api/src/global-knowledge', 'apps/api/src/qdrant',
  'apps/api/src/embeddings', 'apps/api/src/vector-search', 'apps/api/src/vision',
  'apps/api/src/telegram', 'apps/api/src/n8n', 'apps/api/src/workspaces',
  'apps/api/src/users', 'apps/api/src/auth', 'apps/api/src/vehicles',
  'apps/api/src/repair-cases', 'apps/api/src/mechanic-observations',
  'apps/api/src/repair-steps', 'apps/api/src/parts', 'apps/api/src/inventory',
  'apps/api/src/work-orders', 'apps/api/src/invoices', 'apps/api/src/admin',
  'apps/api/src/analytics', 'apps/api/src/marketplace', 'apps/api/src/recommendations',
  'apps/api/src/final-diagnosis', 'apps/api/src/automated-conclusions',
];

const forbiddenDependencies = [
  '@anthropic-ai/sdk', '@nestjs/jwt', '@nestjs/passport', '@prisma/client',
  '@qdrant/js-client-rest', 'better-sqlite3', 'ioredis', 'jsonwebtoken', 'mikro-orm',
  'mongodb', 'mongoose', 'n8n', 'openai', 'passport', 'prisma', 'redis', 'sequelize',
  'sqlite3', 'typeorm',
];

const forbiddenSourcePathTerms = [
  'repair-mentor', 'repair_mentor', 'repairmentor', 'repair-step', 'repair_step',
  'ai-gateway', 'ai_gateway', 'aigateway', 'knowledge', 'qdrant', 'embedding',
  'vector', 'vision', 'recommendation', 'final-diagnosis', 'final_diagnosis',
  'automated-conclusion', 'automated_conclusion',
];

const forbiddenSourceSymbols = [
  'MechanicObservation', 'RepairStep', 'RepairMentor', 'AiGateway', 'AIGateway',
  'KnowledgeService', 'RecommendationService', 'FinalDiagnosis', 'AutomatedConclusion',
];

const forbiddenMigrationTables = [
  'diagnostics', 'measurements', 'mechanic_observations',
  'repair_steps', 'ai_invocations', 'knowledge_assets', 'knowledge_candidates',
  'verified_knowledge_assets', 'ai_results', 'repair_mentor_results', 'recommendations',
  'final_diagnoses', 'automated_conclusions', 'parts', 'inventory', 'work_orders',
  'invoices',
];

let failed = 0;
console.log('\nVS-001 + VS-002 + VS-003 + VS-004 Repository Validation\n');

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
    'db:seed:workspace', 'db:seed:demo', 'db:seed:diagnostics',
  ];
  for (const script of requiredScripts) {
    const ok = typeof packageJson.scripts?.[script] === 'string';
    console.log(`${ok ? 'PASS' : 'FAIL'} required package script: ${script}`);
    if (!ok) failed++;
  }
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  for (const dependency of forbiddenDependencies) {
    const ok = !(dependency in dependencies);
    console.log(`${ok ? 'PASS' : 'FAIL'} forbidden dependency absent: ${dependency}`);
    if (!ok) failed++;
  }
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
