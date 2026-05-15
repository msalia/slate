# Local Setup

## Prerequisites

- Node.js 20+
- npm
- Docker & Docker Compose
- git
- gh CLI (authenticated)

## Getting Started

1. Clone the repo:

   ```bash
   git clone git@github.com:msalia/slate.git
   cd slate
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run tests:

   ```bash
   npm test
   ```

4. Start with Docker Compose (recommended):

   ```bash
   docker compose up --build
   ```

5. Or hybrid mode (faster iteration):

   ```bash
   # Terminal 1 — Database
   docker compose up db

   # Terminal 2 — Web (with hot reload)
   export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/slate
   npm run db:push
   npm run dev
   ```

## Project Structure

```
slate/
├── .env                        # Local dev defaults (committed)
├── docker-compose.yml          # Production compose (web + db)
├── docker-compose.override.yml # Local dev port mappings
├── Dockerfile                  # Multi-stage Next.js build
├── package.json
├── next.config.ts
├── drizzle.config.ts           # Drizzle Kit config
├── db/
│   └── init.sql                # PostgreSQL initialization
├── docs/
│   ├── SPEC.md                 # Product specification
│   ├── INFRASTRUCTURE.md       # Infrastructure details
│   ├── SETUP.md                # This file
│   ├── DEPLOYMENT.md           # Deployment guide
│   └── ARCHITECTURE.md         # Architecture decisions
└── src/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx
    │   └── api/health/route.ts
    ├── db/
    │   ├── index.ts             # Drizzle client
    │   └── schema.ts            # Table definitions
    └── __tests__/
        ├── setup.ts
        └── page.test.tsx
```

## Database Commands

| Command               | Purpose                                     |
| --------------------- | ------------------------------------------- |
| `npm run db:push`     | Sync schema to DB (dev, no migration files) |
| `npm run db:generate` | Generate SQL migration from schema changes  |
| `npm run db:migrate`  | Run pending migrations                      |
| `npm run db:studio`   | Open visual database editor                 |
