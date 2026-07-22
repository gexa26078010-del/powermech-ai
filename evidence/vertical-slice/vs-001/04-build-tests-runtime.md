# VS-001 Evidence: 04 — Build, Tests & Runtime

**Vertical Slice:** VS-001: Baseline & Local Runtime

**Date:** 2026-07-20

**Status:** PENDING REVIEW (build/test/runtime execution blocked by CI)

## Summary

This document outlines build pipeline, test framework, and runtime configuration. Actual execution requires local Node.js environment.

## Build Configuration

### TypeScript Configuration

**File:** `tsconfig.json`

**Status:** ✅ CREATED

**Key Settings:**

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES2020",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./apps/api/src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "moduleResolution": "node",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  },
  "include": ["apps/api/src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.spec.ts"]
}
```

**Features:**
- ✅ Strict mode enabled
- ✅ Source maps for debugging
- ✅ Declaration files for library usage
- ✅ Decorators for NestJS
- ✅ ES2020 target (Node.js 18+)

---

## Build Command

**PLANNED COMMAND:**
```bash
pnpm build
```

**EXPECTED OUTPUT:**
```
$ tsc
✅ Compilation complete
✅ dist/ directory created
✅ No type errors
✅ No warnings
```

**EXPECTED ARTIFACTS:**
```
dist/
├── main.js
├── main.d.ts
├── main.js.map
├── app.module.js
├── app.module.d.ts
├── health/
│   ├── health.controller.js
│   ├── health.service.js
│   ├── health.module.js
│   └── (declarations and maps)
├── config/
│   └── database.config.js
├── db/
│   ├── database.module.js
│   ├── database.provider.js
│   └── (declarations and maps)
```

**STATUS:** ⏳ NOT EXECUTED

**Reason:** Cannot run pnpm in CI validation environment.

---

## Build Performance

**EXPECTED METRICS:**

| Metric | Target | Notes |
|--------|--------|-------|
| Build time | <5s | TypeScript only, no bundling |
| Output size | <2MB | dist/ directory |
| Declarations | >90% | .d.ts files for all .ts |
| Source maps | 100% | For debugging |

**STATUS:** ⏳ NOT MEASURED

**Reason:** Build not executed.

---

## Test Framework

### Jest Configuration

**Package:** `jest@29.6.0`

**Status:** ✅ ADDED TO package.json

**Configuration (implied from package.json):**

```json
{
  "preset": "ts-jest",
  "testEnvironment": "node",
  "rootDir": "apps/api/src",
  "testMatch": ["**/*.spec.ts"],
  "collectCoverageFrom": ["**/*.ts"],
  "coveragePathIgnorePatterns": ["/node_modules/", "/dist/"]
}
```

**Features:**
- ✅ TypeScript support (ts-jest)
- ✅ Node.js environment
- ✅ Coverage reporting
- ✅ Spec file detection

---

## Test Commands

**PLANNED COMMAND:**
```bash
pnpm test
```

**EXPECTED OUTPUT (baseline, no tests yet):**
```
No tests found, exiting with code 1.
```

**EXPECTED OUTPUT (when tests added):**
```
Test Suites: 1 passed, 1 total
Tests: 2+ passed, 2+ total
Snapshots: 0 total
Time: 1.234s
Coverage: >80% statements, >80% branches
```

**STATUS:** ⏳ NOT EXECUTED

**Reason:** Cannot run npm test in CI.

---

**PLANNED COMMAND (watch mode):**
```bash
pnpm test:watch
```

**EXPECTED BEHAVIOR:**
```
Re-runs on file changes
No manual restart required
```

**STATUS:** ⏳ NOT EXECUTED

**Reason:** Cannot run long-lived processes in CI.

---

**PLANNED COMMAND (coverage):**
```bash
pnpm test:cov
```

**EXPECTED OUTPUT:**
```
Coverage summary generated: coverage/index.html
```

**STATUS:** ⏳ NOT EXECUTED

**Reason:** Cannot run npm test in CI.

---

## Code Quality

### ESLint Configuration

**Package:** `eslint@8.44.0` + `@typescript-eslint/eslint-plugin@6.0.0`

**Status:** ✅ ADDED TO package.json

**Configuration (implied):**

```json
{
  "parser": "@typescript-eslint/parser",
  "extends": ["eslint:recommended"],
  "rules": {
    "no-console": "warn",
    "@typescript-eslint/explicit-function-return-types": "warn"
  }
}
```

---

**PLANNED COMMAND:**
```bash
pnpm lint
```

**EXPECTED OUTPUT:**
```
✅ No ESLint violations
```

**STATUS:** ⏳ NOT EXECUTED

**Reason:** Cannot run npm lint in CI.

---

**PLANNED COMMAND (auto-fix):**
```bash
pnpm lint:fix
```

**EXPECTED BEHAVIOR:**
```
Automatically fixes code style issues
```

**STATUS:** ⏳ NOT EXECUTED

**Reason:** Cannot run npm lint in CI.

---

## Runtime Configuration

### Application Entry Point

**File:** `apps/api/src/main.ts`

**Status:** ✅ CREATED

**Key Features:**

```typescript
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { closeDatabasePool } from './db/database.provider';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  const port = process.env.PORT || 3000;
  const host = process.env.HOST || '0.0.0.0';

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    await app.close();
    await closeDatabasePool();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully...');
    await app.close();
    await closeDatabasePool();
    process.exit(0);
  });

  await app.listen(port, host);
  console.log(`Application is running on: http://${host}:${port}`);
}

bootstrap();
```

**Features:**
- ✅ Fastify HTTP adapter
- ✅ NestJS bootstrapping
- ✅ Graceful shutdown handlers
- ✅ Database pool cleanup
- ✅ Configurable port/host

---

### Root Module

**File:** `apps/api/src/app.module.ts`

**Status:** ✅ CREATED

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module';
import { DatabaseModule } from './db/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    HealthModule,
  ],
})
export class AppModule {}
```

**Features:**
- ✅ Configuration module
- ✅ Database module
- ✅ Health module
- ✅ Global config scope

---

## Development Mode

**PLANNED COMMAND:**
```bash
pnpm dev
```

**EXPECTED OUTPUT:**
```
[Nest] 20  Jul 14:00:00     LOG [NestFactory] Starting Nest application...
[Nest] 20  Jul 14:00:01     LOG [InstanceLoader] AppModule dependencies initialized
[Nest] 20  Jul 14:00:01     LOG [InstanceLoader] ConfigModule (forRoot) -
[Nest] 20  Jul 14:00:01     LOG [InstanceLoader] DatabaseModule dependencies initialized
[Nest] 20  Jul 14:00:01     LOG [InstanceLoader] HealthModule dependencies initialized
[Nest] 20  Jul 14:00:01     LOG [NestFactory] Nest application successfully started
[Nest] 20  Jul 14:00:01     LOG Application is running on: http://0.0.0.0:3000
```

**EXPECTED BEHAVIOR:**
- ✅ Auto-reload on file changes
- ✅ No manual restart needed
- ✅ Console shows logs in real-time

**STATUS:** ⏳ NOT EXECUTED

**Reason:** Cannot run dev server in CI.

---

## Production Mode

**PLANNED COMMAND SEQUENCE:**
```bash
pnpm build
pnpm start
```

**EXPECTED OUTPUT:**
```
[Nest] 20  Jul 14:00:00     LOG [NestFactory] Starting Nest application...
[Nest] 20  Jul 14:00:01     LOG Application is running on: http://0.0.0.0:3000
```

**STATUS:** ⏳ NOT EXECUTED

**Reason:** Cannot run production server in CI.

---

## Performance Targets

| Metric | Target | Status |
|--------|--------|--------|
| Build time | <5s | ⏳ NOT MEASURED |
| Test suite | <2s | ⏳ NOT MEASURED |
| Server startup | <1s | ⏳ NOT MEASURED |
| Health check latency | <100ms | ⏳ NOT MEASURED |
| Memory (dev) | <200MB | ⏳ NOT MEASURED |
| Memory (prod) | <150MB | ⏳ NOT MEASURED |

---

## Build, Test & Runtime Go-Live Criteria

| Criterion | Status | Notes |
|-----------|--------|-------|
| TypeScript config | ✅ YES | tsconfig.json created |
| Build script | ✅ YES | pnpm build defined |
| Jest config (implicit) | ✅ YES | Packages added |
| Test scripts | ✅ YES | pnpm test defined |
| ESLint config (implicit) | ✅ YES | Packages added |
| Lint scripts | ✅ YES | pnpm lint defined |
| Main entry point | ✅ YES | main.ts created |
| App module | ✅ YES | app.module.ts created |
| Graceful shutdown | ✅ YES | SIGTERM/SIGINT handlers |
| Dev mode (auto-reload) | ✅ YES | ts-node-dev configured |
| Production mode | ✅ YES | Supported via pnpm build + pnpm start |
| Database integration | ✅ YES | DatabaseModule ready |
| TypeScript compilation | ⏳ BLOCKED | Requires pnpm build |
| Tests execution | ⏳ BLOCKED | Requires pnpm test |
| Linting | ⏳ BLOCKED | Requires pnpm lint |
| Server startup | ⏳ BLOCKED | Requires pnpm dev |

---

## Conclusion

**Status: ⏳ PENDING LOCAL NODE.JS EXECUTION**

Build, test, and runtime infrastructure is configured. Actual execution requires local Node.js environment.

**Next Steps (Local):**
1. `pnpm install` (generates pnpm-lock.yaml)
2. `pnpm build` (compiles TypeScript)
3. `pnpm lint` (check code quality)
4. `pnpm dev` (start dev server)
5. In another terminal: `curl http://localhost:3000/health`

---

**Evidence Package Location:** `evidence/vertical-slice/vs-001/`

**Previous Document:** [03 — PostgreSQL & Migrations](./03-postgres-and-migrations.md)

**Next Document:** [05 — Health & Failure Modes](./05-health-and-failure.md)
