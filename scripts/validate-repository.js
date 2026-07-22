#!/usr/bin/env node
const fs = require('fs');

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
];

const forbiddenPaths = [
  'evidence/vs-001', 'evidence/vs-002', 'POWERMECH_AI_MASTER_AUDIT.md',
  'POWERMECH_AI_DECISION_LOG.md', 'POWERMECH_AI_IMPLEMENTATION_STATUS.md',
  'POWERMECH_AI_CTO_REVIEW_NOTES.md', 'src', 'apps/api/src/repair-mentor',
  'apps/api/src/ai-gateway', 'apps/api/src/knowledge', 'apps/api/src/knowledge-service',
  'apps/api/src/corporate-knowledge', 'apps/api/src/global-knowledge', 'apps/api/src/qdrant',
  'apps/api/src/embeddings', 'apps/api/src/vector-search', 'apps/api/src/vision',
  'apps/api/src/telegram', 'apps/api/src/n8n', 'apps/api/src/workspaces',
  'apps/api/src/users', 'apps/api/src/auth', 'apps/api/src/vehicles',
  'apps/api/src/repair-cases', 'apps/api/src/diagnostics', 'apps/api/src/measurements',
];

const forbiddenDependencies = [
  '@anthropic-ai/sdk', '@nestjs/jwt', '@nestjs/passport', '@prisma/client',
  '@qdrant/js-client-rest', 'better-sqlite3', 'ioredis', 'jsonwebtoken', 'mikro-orm',
  'mongodb', 'mongoose', 'n8n', 'openai', 'passport', 'prisma', 'redis', 'sequelize',
  'sqlite3', 'typeorm',
];

let failed = 0;
console.log('\nVS-001 + VS-002 Repository Validation\n');

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
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  for (const dependency of forbiddenDependencies) {
    const ok = !(dependency in dependencies);
    console.log(`${ok ? 'PASS' : 'FAIL'} forbidden dependency absent: ${dependency}`);
    if (!ok) failed++;
  }
}

if (fs.existsSync('pnpm-lock.yaml')) {
  const ok = !/placeholder/i.test(fs.readFileSync('pnpm-lock.yaml', 'utf8'));
  console.log(`${ok ? 'PASS' : 'FAIL'} pnpm-lock.yaml is not placeholder`);
  if (!ok) failed++;
}

console.log(`\nValidation result: ${failed === 0 ? 'PASS' : 'FAIL'}\n`);
process.exit(failed === 0 ? 0 : 1);
