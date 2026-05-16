# Cueflo

Event schedule management tool for organizers of single or multi-day events.

## Stack

- **Framework:** Next.js 15+ (App Router), TypeScript, Tailwind CSS
- **Database:** Drizzle ORM + PostgreSQL 16
- **Deployment:** Docker Compose on Dokploy

## Development

```bash
# Install dependencies
npm install

# Start with Docker Compose
docker compose up --build

# Or hybrid mode (DB in Docker, Next.js native)
docker compose up db
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cueflo
npm run db:push
npm run dev
```

## Documentation

- [Product Spec](docs/SPEC.md)
- [Local Setup](docs/SETUP.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Infrastructure](docs/INFRASTRUCTURE.md)
- [Architecture Decisions](docs/ARCHITECTURE.md)
