# VS-001 Evidence: 02 — Environment

**Vertical Slice:** VS-001: Baseline & Local Runtime

**Date:** 2026-07-20

**Status:** PENDING REVIEW (environment setup not executed in CI)

## Summary

This document outlines environment setup, configuration management, and prerequisites. Actual verification blocked by CI environment limitations.

## Environment Files

### .env.example

**File:** `.env.example`

**Status:** ✅ CREATED

**Content:**
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=powermech
DB_PASSWORD=powermech_local
DB_NAME=powermech_dev

PORT=3000
HOST=0.0.0.0
NODE_ENV=development

DB_POOL_MIN=2
DB_POOL_MAX=20
DB_POOL_IDLE_TIMEOUT=30000
DB_POOL_CONNECTION_TIMEOUT=2000
```

### .env (User-Created)

**Status:** ⏳ BLOCKED (requires local execution)

**Expected:** Created by `cp .env.example .env`

**How to create locally:**
```bash
cp .env.example .env
```

## Prerequisites Verification

### Node.js 18+

**PLANNED VERIFICATION:**
```bash
node --version
```

**EXPECTED OUTPUT:**
```
v18.16.0
```

**STATUS:** ⏳ NOT EXECUTED

**Reason:** Cannot check system packages in CI environment.

---

### pnpm 8+

**PLANNED VERIFICATION:**
```bash
pnpm --version
```

**EXPECTED OUTPUT:**
```
8.6.0
```

**STATUS:** ⏳ NOT EXECUTED

**Reason:** Cannot verify package manager in validation environment.

---

### PostgreSQL 14+

**Method 1: Docker (Recommended)**

**PLANNED VERIFICATION:**
```bash
docker --version
psql --version
```

**EXPECTED OUTPUT:**
```
Docker version 24.0.0
psql (PostgreSQL) 14.9
```

**STATUS:** ⏳ NOT EXECUTED

**Reason:** No Docker runtime in CI.

---

**Method 2: Local Installation**

**PLANNED VERIFICATION:**
```bash
pg_isready -h localhost -p 5432 -U powermech
```

**EXPECTED OUTPUT:**
```
accepting connections
```

**STATUS:** ⏳ NOT EXECUTED

**Reason:** PostgreSQL not running in CI.

---

### Git 2.30+

**PLANNED VERIFICATION:**
```bash
git --version
```

**EXPECTED OUTPUT:**
```
git version 2.40.0
```

**STATUS:** ⏳ NOT EXECUTED

**Reason:** Not critical for baseline verification.

---

## Docker Compose Setup

**File:** `docker-compose.yml`

**Status:** ✅ CREATED

**Configuration:**

```yaml
services:
  postgres:
    image: postgres:14-alpine
    container_name: powermech-postgres
    environment:
      POSTGRES_USER: powermech
      POSTGRES_PASSWORD: powermech_local
      POSTGRES_DB: powermech_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U powermech"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped
```

### Startup (Planned)

**PLANNED COMMAND:**
```bash
docker-compose up -d postgres
sleep 5
docker-compose ps
```

**EXPECTED OUTPUT:**
```
NAME                COMMAND           SERVICE    STATUS
powermech-postgres  postgres          postgres   Up 5s (healthy)
```

**STATUS:** ⏳ NOT EXECUTED

**Reason:** No Docker in CI.

---

### Verification (Planned)

**PLANNED COMMAND:**
```bash
psql -h localhost -U powermech -d powermech_dev -c "SELECT version();"
```

**EXPECTED OUTPUT:**
```
PostgreSQL 14.9 (Debian 14.9-1.pgdg120+1) on x86_64-pc-linux-gnu
```

**STATUS:** ⏳ NOT EXECUTED

**Reason:** PostgreSQL not running.

---

## Configuration Management

**File:** `apps/api/src/config/database.config.ts`

**Status:** ✅ CREATED

**Implementation:**

```typescript
export const databaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'powermech',
  password: process.env.DB_PASSWORD || 'powermech_local',
  database: process.env.DB_NAME || 'powermech_dev',
  max: parseInt(process.env.DB_POOL_MAX || '20', 10),
  min: parseInt(process.env.DB_POOL_MIN || '2', 10),
  idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '30000', 10),
  connectionTimeoutMillis: parseInt(process.env.DB_POOL_CONNECTION_TIMEOUT || '2000', 10),
};
```

**Features:**
- ✅ Environment-driven configuration
- ✅ Safe defaults
- ✅ Type-safe parsing
- ✅ Connection pool sizing

---

## Database Provider

**File:** `apps/api/src/db/database.provider.ts`

**Status:** ✅ CREATED

**Implementation:**

```typescript
import { Pool } from 'pg';
import { databaseConfig } from '../config/database.config';

let pool: Pool | null = null;

export const getDatabasePool = (): Pool => {
  if (!pool) {
    pool = new Pool(databaseConfig);

    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      process.exit(-1);
    });
  }
  return pool;
};

export const closeDatabasePool = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    pool = null;
  }
};
```

**Features:**
- ✅ Singleton pool instance
- ✅ Error handling (process exit on pool error)
- ✅ Graceful shutdown support
- ✅ Lazy initialization

---

## NestJS Integration

**File:** `apps/api/src/db/database.module.ts`

**Status:** ✅ CREATED

**Implementation:**

```typescript
import { Module } from '@nestjs/common';
import { getDatabasePool } from './database.provider';

@Module({
  providers: [
    {
      provide: 'DATABASE_POOL',
      useFactory: () => getDatabasePool(),
    },
  ],
  exports: ['DATABASE_POOL'],
})
export class DatabaseModule {}
```

**Features:**
- ✅ NestJS module pattern
- ✅ Dependency injection token
- ✅ Exported for other modules
- ✅ No ORM dependencies

---

## Environment Load Test (Planned)

**PLANNED COMMAND:**
```bash
pnpm build
node -e "require('./dist/main.js')"
```

**EXPECTED OUTPUT:**
```
[Nest] 20  Jul 14:00:00     LOG [NestFactory] Starting Nest application...
[Nest] 20  Jul 14:00:01     LOG [InstanceLoader] AppModule dependencies initialized
[Nest] 20  Jul 14:00:01     LOG [InstanceLoader] DatabaseModule dependencies initialized
[Nest] 20  Jul 14:00:01     LOG Application is running on: http://0.0.0.0:3000
```

**STATUS:** ⏳ NOT EXECUTED

**Reason:** Requires build and running server.

---

## Environment Go-Live Criteria

| Criterion | Status | Notes |
|-----------|--------|-------|
| `.env.example` template | ✅ YES | File created |
| `databaseConfig` module | ✅ YES | Configuration centralized |
| `DatabaseModule` | ✅ YES | NestJS module ready |
| `database.provider` | ✅ YES | pg Pool singleton ready |
| Node.js 18+ check | ⏳ BLOCKED | CI limitation |
| pnpm 8+ check | ⏳ BLOCKED | CI limitation |
| PostgreSQL 14+ running | ⏳ BLOCKED | No Docker in CI |
| Environment loads | ⏳ BLOCKED | Requires build + runtime |
| Configuration injectable | ✅ YES | Code pattern ready |
| Connection pool active | ⏳ BLOCKED | Requires running server |

---

## Connection Pool Configuration

**Default Settings:**

```
DB_POOL_MIN=2              # Minimum idle connections
DB_POOL_MAX=20             # Maximum concurrent connections
DB_POOL_IDLE_TIMEOUT=30s   # Idle connection timeout
DB_POOL_CONNECTION_TIMEOUT=2s  # Connection attempt timeout
```

**Rationale:**
- Min=2: Avoid cold starts
- Max=20: Reasonable for local development + small production
- Idle timeout: Standard PostgreSQL default
- Connection timeout: Fail fast on unavailable database

---

## Conclusion

**Status: ⏳ PENDING LOCAL EXECUTION**

Environment setup code is ready. Prerequisites and runtime verification require local Docker + Node.js execution.

**Next Steps:**
1. Locally: `pnpm install`
2. Locally: `docker-compose up -d postgres`
3. Locally: `pnpm build`
4. Locally: `pnpm dev`
5. Verify: `curl http://localhost:3000/health`

---

**Evidence Package Location:** `evidence/vertical-slice/vs-001/`

**Previous Document:** [01 — Baseline & Commands](./01-baseline-and-commands.md)

**Next Document:** [03 — PostgreSQL & Migrations](./03-postgres-and-migrations.md)
