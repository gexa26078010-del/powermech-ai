# PowerMech AI

**AI Operating System / SaaS platform for service centers.**

**Mission:** We do not automate repair. We scale human experience.

**First market:** Powersport service — ATV, UTV, jet ski, snowmobile.

## Repository Status

This repository implements **VS-001: Baseline & Local Runtime** — the minimal reproducible technical baseline.

### Current Phase

- **VS-001:** Baseline initialization in progress
- **VS-002 onwards:** Locked until VS-001 Final GO

## Quick Start

### Prerequisites

- Node.js 18+ (verify with `node --version`)
- pnpm 8+ (install with `npm install -g pnpm`)
- PostgreSQL 14+ (local or Docker)
- Docker (optional, for PostgreSQL via docker-compose)

### Setup

```bash
# Install dependencies
pnpm install

# Configure local environment
cp .env.example .env

# Start PostgreSQL (if using Docker)
docker-compose up -d postgres

# Apply migrations
pnpm db:migrate

# Build backend
pnpm build

# Run tests
pnpm test

# Start development server
pnpm dev

# Check health
curl http://localhost:3000/health
```

## Tech Stack

- **Backend Framework:** NestJS
- **HTTP Adapter:** Fastify
- **Language:** TypeScript
- **Database:** PostgreSQL
- **Migration Tool:** node-pg-migrate
- **Package Manager:** pnpm
- **CI:** GitHub Actions

## Documentation

- [Developer Runbook](./docs/implementation/vs-001-local-runtime.md) — Complete setup & development guide
- [VS-001 Evidence](./evidence/vertical-slice/vs-001/) — Technical verification package

## Architecture

```
powermech-ai/
├── apps/api/                  # Backend (NestJS + Fastify)
│   ├── src/
│   │   ├── main.ts           # Application entry point
│   │   ├── app.module.ts     # Root module
│   │   ├── health/           # Health check controller & service
│   │   ├── config/           # Configuration management
│   │   └── db/               # Database connection
│   └── test/                 # Automated tests
├── migrations/               # Database migrations (node-pg-migrate)
├── docs/
│   └── implementation/       # Implementation guides
└── evidence/                 # Technical evidence package
    └── vertical-slice/
        └── vs-001/           # VS-001 verification files
```

## Canonical Commands

```bash
pnpm install          # Install dependencies
pnpm build            # Build backend
pnpm test             # Run tests
pnpm lint             # Run linter
pnpm db:migrate       # Apply pending migrations
pnpm db:reset         # Reset database and reapply migrations
pnpm dev              # Start development server with auto-reload
pnpm start            # Start production server
pnpm repository:validate  # Run repository validation checks
```

## Development

### Running Locally

1. Start PostgreSQL: `docker-compose up -d postgres`
2. Apply migrations: `pnpm db:migrate`
3. Start server: `pnpm dev`
4. Check health: `curl http://localhost:3000/health`

### Resetting Database

```bash
pnpm db:reset
```

### Running Tests

```bash
pnpm test
```

## Governance

- **Sections 00–132:** APPROVED / FIXED
- **Section 132 Governance Patch:** APPROVED / FIXED
- **VS-001:** In progress
- **VS-002+:** Locked

## License

Private / Proprietary
