# VS-001 Evidence: 05 — Health & Failure Modes

**Vertical Slice:** VS-001: Baseline & Local Runtime

**Date:** 2026-07-20

**Status:** PENDING REVIEW (runtime verification blocked by CI)

## Summary

This document outlines health checks, failure modes, and error handling patterns. Actual verification requires local runtime.

## Health Check Implementation

### Controller

**File:** `apps/api/src/health/health.controller.ts`

**Status:** ✅ CREATED

```typescript
import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async check() {
    const health = await this.healthService.check();
    if (health.status !== 'ok') {
      throw new ServiceUnavailableException({
        status: 'unavailable',
        message: 'Health check failed',
        details: health,
      });
    }
    return health;
  }
}
```

**Features:**
- ✅ Returns 200 OK only if database is OK
- ✅ Returns 503 Service Unavailable if database fails
- ✅ No false green (critical for operational reliability)
- ✅ Async/await for database check

---

### Service

**File:** `apps/api/src/health/health.service.ts`

**Status:** ✅ CREATED

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class HealthService {
  constructor(@Inject('DATABASE_POOL') private pool: Pool) {}

  async check() {
    const timestamp = new Date().toISOString();
    
    try {
      // Test PostgreSQL connectivity with 2-second timeout
      const client = await Promise.race([
        this.pool.connect(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Database connection timeout')), 2000),
        ),
      ]) as any;

      const result = await client.query('SELECT NOW()');
      client.release();

      return {
        status: 'ok',
        database: 'ok',
        timestamp,
        version: '0.1.0',
        database_time: result.rows[0].now,
      };
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        status: 'unhealthy',
        database: 'error',
        timestamp,
        error: error.message,
        version: '0.1.0',
      };
    }
  }
}
```

**Features:**
- ✅ Real PostgreSQL connectivity check
- ✅ Executes actual query (SELECT NOW())
- ✅ 2-second connection timeout (fail fast)
- ✅ Returns unhealthy status on failure
- ✅ Proper error handling and logging

---

## Planned Health Check Responses

### Success Case (Database Running)

**PLANNED REQUEST:**
```bash
curl -i http://localhost:3000/health
```

**EXPECTED RESPONSE:**
```
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 145

{
  "status": "ok",
  "database": "ok",
  "timestamp": "2026-07-20T14:00:00.000Z",
  "version": "0.1.0",
  "database_time": "2026-07-20T14:00:00.000000+00:00"
}
```

**STATUS:** ⏳ NOT EXECUTED

**Reason:** Server not running in CI.

---

### Failure Case (Database Down)

**PLANNED SCENARIO:**
```bash
# PostgreSQL not running or connection refused
curl -i http://localhost:3000/health
```

**EXPECTED RESPONSE (503):**
```
HTTP/1.1 503 Service Unavailable
Content-Type: application/json
Content-Length: 220

{
  "message": "Health check failed",
  "error": "Service Unavailable",
  "statusCode": 503,
  "details": {
    "status": "unhealthy",
    "database": "error",
    "timestamp": "2026-07-20T14:00:00.000Z",
    "error": "Error: connect ECONNREFUSED 127.0.0.1:5432",
    "version": "0.1.0"
  }
}
```

**KEY POINT:** NOT 200 OK with false status. Properly indicates unhealthy state.

**STATUS:** ⏳ NOT EXECUTED

**Reason:** Server not running in CI.

---

### Timeout Case (Database Slow)

**PLANNED SCENARIO:**
```bash
# Database connection hangs
# Health check waits 2 seconds, then times out
curl -i http://localhost:3000/health
```

**EXPECTED RESPONSE (503):**
```
HTTP/1.1 503 Service Unavailable

{
  "message": "Health check failed",
  "statusCode": 503,
  "details": {
    "status": "unhealthy",
    "database": "error",
    "error": "Database connection timeout",
    "version": "0.1.0"
  }
}
```

**STATUS:** ⏳ NOT EXECUTED

**Reason:** Requires specific failure scenario in running environment.

---

## Failure Mode: Server Not Running

**PLANNED SCENARIO:**
```bash
curl http://localhost:3000/health
```

**EXPECTED OUTPUT:**
```
curl: (7) Failed to connect to localhost port 3000: Connection refused
```

**DIAGNOSIS:**
- Server crashed
- Server not started
- Wrong port number

**RECOVERY:**
```bash
pnpm dev
```

**STATUS:** ⏳ NOT EXECUTED

**Reason:** Server not running in CI.

---

## Failure Mode: Invalid Route

**PLANNED REQUEST:**
```bash
curl http://localhost:3000/invalid
```

**EXPECTED RESPONSE (404):**
```
HTTP/1.1 404 Not Found
Content-Type: application/json

{
  "statusCode": 404,
  "message": "Cannot GET /invalid",
  "error": "Not Found"
}
```

**HANDLED BY:** NestJS default exception handling

**STATUS:** ⏳ NOT EXECUTED

**Reason:** Server not running in CI.

---

## Error Handling Patterns

### Global Exception Filter (Future Implementation)

**Pattern (documented for future):**

```typescript
import { Catch, ArgumentsHost, ExceptionFilter, HttpException } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    
    const status = exception instanceof HttpException
      ? exception.getStatus()
      : 500;

    const message = exception instanceof Error ? exception.message : 'Internal Server Error';

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
```

**Status:** DOCUMENTED (not yet implemented in baseline)

---

## Database Resilience

### Connection Pool

**Configuration:** `apps/api/src/config/database.config.ts`

```typescript
export const databaseConfig = {
  // ...
  max: 20,                    // Max concurrent connections
  min: 2,                     // Min idle connections
  idleTimeoutMillis: 30000,   // Idle connection timeout
  connectionTimeoutMillis: 2000, // Connection attempt timeout
};
```

**Features:**
- ✅ Connection pooling (20 max)
- ✅ Minimum idle connections (2)
- ✅ Auto-reconnect on idle timeout
- ✅ 2-second connection timeout (fail fast)

---

### Graceful Shutdown

**File:** `apps/api/src/main.ts`

**Implementation:**

```typescript
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
```

**Features:**
- ✅ Closes NestJS app
- ✅ Closes database pool
- ✅ Prevents connection leaks
- ✅ Allows pending requests to complete

---

## Testing (Future)

**Health Service Test Pattern:**

```typescript
describe('HealthService', () => {
  let service: HealthService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [HealthService],
    }).compile();

    service = module.get<HealthService>(HealthService);
  });

  it('should return ok status when database available', async () => {
    const result = await service.check();
    expect(result.status).toBe('ok');
    expect(result.database).toBe('ok');
  });

  it('should return unhealthy status when database unavailable', async () => {
    // Mock pool.connect() to throw
    const result = await service.check();
    expect(result.status).toBe('unhealthy');
    expect(result.database).toBe('error');
  });
});
```

**Status:** DOCUMENTED (test files not created in baseline)

---

## Health & Failure Go-Live Criteria

| Criterion | Status | Notes |
|-----------|--------|-------|
| Health endpoint implemented | ✅ YES | Controller + Service |
| Returns 200 only when healthy | ✅ YES | Code pattern verified |
| Returns 503 when unhealthy | ✅ YES | Throws ServiceUnavailableException |
| Database connectivity check | ✅ YES | Real pg query (SELECT NOW()) |
| Connection timeout (2s) | ✅ YES | Promise.race with timeout |
| No false green | ✅ YES | Proper error handling |
| Graceful shutdown | ✅ YES | SIGTERM/SIGINT handlers |
| Connection pool configured | ✅ YES | Pool settings applied |
| Error logging | ✅ YES | console.error on failures |
| Health endpoint responses | ⏳ BLOCKED | Requires running server |
| Failure modes tested | ⏳ BLOCKED | Requires test execution |
| Error filter pattern | ✅ YES | Documented for future |

---

## Monitoring (Future Enhancements)

**Post-VS-001 (in VS-002+):**

- [ ] Prometheus metrics endpoint
- [ ] Request latency tracking
- [ ] Error rate monitoring
- [ ] Database query performance
- [ ] Alerting rules
- [ ] Distributed tracing

**Status:** NOTED (not in VS-001 scope)

---

## Conclusion

**Status: ⏳ PENDING LOCAL RUNTIME VERIFICATION**

Health check implementation and error handling patterns are complete. Actual endpoint verification requires local running server.

**Next Steps (Local):**
1. `pnpm build`
2. `docker-compose up -d postgres`
3. `pnpm dev`
4. In another terminal: `curl http://localhost:3000/health`
5. Verify response contains {status: "ok", database: "ok"}
6. Stop Docker: `docker-compose down`
7. Verify health endpoint returns 503

---

**Evidence Package Location:** `evidence/vertical-slice/vs-001/`

**Previous Document:** [04 — Build, Tests & Runtime](./04-build-tests-runtime.md)

**Next Document:** [06 — Final Gate](./06-final-gate.md)
