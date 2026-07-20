#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * VS-001 Repository Validation Script
 *
 * Verifies that the repository structure, configuration,
 * and required files are present and correct.
 *
 * Exit codes:
 *   0 = All checks passed
 *   1 = One or more checks failed
 */

const checks = [
  {
    name: 'package.json exists',
    fn: () => fs.existsSync('package.json'),
  },
  {
    name: 'tsconfig.json exists',
    fn: () => fs.existsSync('tsconfig.json'),
  },
  {
    name: 'docker-compose.yml exists',
    fn: () => fs.existsSync('docker-compose.yml'),
  },
  {
    name: '.env.example exists',
    fn: () => fs.existsSync('.env.example'),
  },
  {
    name: 'README.md exists',
    fn: () => fs.existsSync('README.md'),
  },
  {
    name: 'apps/api/src/main.ts exists',
    fn: () => fs.existsSync(path.join('apps/api/src', 'main.ts')),
  },
  {
    name: 'apps/api/src/app.module.ts exists',
    fn: () => fs.existsSync(path.join('apps/api/src', 'app.module.ts')),
  },
  {
    name: 'apps/api/src/health/health.controller.ts exists',
    fn: () => fs.existsSync(path.join('apps/api/src/health', 'health.controller.ts')),
  },
  {
    name: 'apps/api/src/health/health.service.ts exists',
    fn: () => fs.existsSync(path.join('apps/api/src/health', 'health.service.ts')),
  },
  {
    name: 'migrations directory exists',
    fn: () => fs.existsSync('migrations') && fs.statSync('migrations').isDirectory(),
  },
  {
    name: 'evidence/vertical-slice/vs-001 directory exists',
    fn: () => fs.existsSync(path.join('evidence/vertical-slice/vs-001')) && 
              fs.statSync(path.join('evidence/vertical-slice/vs-001')).isDirectory(),
  },
  {
    name: 'evidence/vertical-slice/vs-001/02-environment.md exists',
    fn: () => fs.existsSync(path.join('evidence/vertical-slice/vs-001', '02-environment.md')),
  },
  {
    name: 'evidence/vertical-slice/vs-001/03-postgres-and-migrations.md exists',
    fn: () => fs.existsSync(path.join('evidence/vertical-slice/vs-001', '03-postgres-and-migrations.md')),
  },
  {
    name: 'evidence/vertical-slice/vs-001/04-build-tests-runtime.md exists',
    fn: () => fs.existsSync(path.join('evidence/vertical-slice/vs-001', '04-build-tests-runtime.md')),
  },
  {
    name: 'evidence/vertical-slice/vs-001/05-health-and-failure.md exists',
    fn: () => fs.existsSync(path.join('evidence/vertical-slice/vs-001', '05-health-and-failure.md')),
  },
  {
    name: 'evidence/vertical-slice/vs-001/06-final-gate.md exists',
    fn: () => fs.existsSync(path.join('evidence/vertical-slice/vs-001', '06-final-gate.md')),
  },
  {
    name: 'evidence/vertical-slice/vs-001/01-baseline-and-commands.md exists',
    fn: () => fs.existsSync(path.join('evidence/vertical-slice/vs-001', '01-baseline-and-commands.md')),
  },
  {
    name: 'forbidden: evidence/vs-001 directory does NOT exist',
    fn: () => !fs.existsSync(path.join('evidence/vs-001')),
  },
  {
    name: 'forbidden: pnpm-lock.yaml does NOT exist (placeholder)',
    fn: () => {
      if (!fs.existsSync('pnpm-lock.yaml')) {
        return true;
      }
      const content = fs.readFileSync('pnpm-lock.yaml', 'utf-8');
      return !content.includes('PLACEHOLDER');
    },
  },
  {
    name: 'docs/implementation/vs-001-local-runtime.md exists',
    fn: () => fs.existsSync(path.join('docs/implementation', 'vs-001-local-runtime.md')),
  },
  {
    name: '.github/workflows/repository-validation.yml exists',
    fn: () => fs.existsSync(path.join('.github/workflows', 'repository-validation.yml')),
  },
];

let passed = 0;
let failed = 0;

console.log('\n🔍 VS-001 Repository Validation\n');

for (const check of checks) {
  const result = check.fn();
  const icon = result ? '✓' : '✗';
  const status = result ? 'PASS' : 'FAIL';

  console.log(`  ${icon} ${check.name.padEnd(60)} [${status}]`);

  if (result) {
    passed++;
  } else {
    failed++;
  }
}

console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);

if (failed > 0) {
  process.exit(1);
}

process.exit(0);
