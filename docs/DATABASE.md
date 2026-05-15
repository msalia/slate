# Database Schema

PostgreSQL database managed via Drizzle ORM. Schema defined in `src/db/schema.ts`.

---

## Tables

### `users`

| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PK, auto-generated |
| `email` | text | NOT NULL, UNIQUE |
| `name` | text | NOT NULL |
| `password_hash` | text | nullable (for OAuth users) |
| `avatar_url` | text | nullable |
| `created_at` | timestamptz | NOT NULL, default now() |
| `updated_at` | timestamptz | NOT NULL, default now() |

### `events`

| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PK, auto-generated |
| `user_id` | uuid | NOT NULL, FK → users.id (CASCADE) |
| `name` | text | NOT NULL |
| `slug` | text | NOT NULL, UNIQUE |
| `description` | text | nullable |
| `start_date` | timestamptz | NOT NULL |
| `end_date` | timestamptz | NOT NULL |
| `timezone` | text | NOT NULL, default 'UTC' |
| `status` | event_status | NOT NULL, default 'draft' |
| `created_at` | timestamptz | NOT NULL, default now() |
| `updated_at` | timestamptz | NOT NULL, default now() |

**Enum `event_status`:** `'draft'` | `'published'`

### `tracks`

| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PK, auto-generated |
| `event_id` | uuid | NOT NULL, FK → events.id (CASCADE) |
| `name` | text | NOT NULL |
| `position` | integer | NOT NULL, default 0 |

### `categories`

| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PK, auto-generated |
| `user_id` | uuid | NOT NULL, FK → users.id (CASCADE) |
| `name` | text | NOT NULL |
| `color` | text | NOT NULL (CSS variable name, e.g. `category-blue`) |
| `created_at` | timestamptz | NOT NULL, default now() |

### `event_categories` (junction)

| Column | Type | Constraints |
|---|---|---|
| `event_id` | uuid | PK, FK → events.id (CASCADE) |
| `category_id` | uuid | PK, FK → categories.id (CASCADE) |

### `presenters`

| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PK, auto-generated |
| `user_id` | uuid | NOT NULL, FK → users.id (CASCADE) |
| `name` | text | NOT NULL |
| `role` | text | nullable |
| `photo_path` | text | nullable |
| `created_at` | timestamptz | NOT NULL, default now() |

### `sessions`

| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PK, auto-generated |
| `event_id` | uuid | NOT NULL, FK → events.id (CASCADE) |
| `track_id` | uuid | nullable, FK → tracks.id (SET NULL) |
| `category_id` | uuid | nullable, FK → categories.id (SET NULL) |
| `title` | text | NOT NULL |
| `description` | text | nullable |
| `start_time` | timestamptz | NOT NULL |
| `end_time` | timestamptz | NOT NULL |
| `is_break` | boolean | NOT NULL, default false |
| `position` | integer | NOT NULL, default 0 |
| `created_at` | timestamptz | NOT NULL, default now() |
| `updated_at` | timestamptz | NOT NULL, default now() |

### `session_presenters` (junction)

| Column | Type | Constraints |
|---|---|---|
| `session_id` | uuid | PK, FK → sessions.id (CASCADE) |
| `presenter_id` | uuid | PK, FK → presenters.id (CASCADE) |

---

## Relationships

```
users ──< events ──< tracks
  │         │ ╲──< sessions ──< session_presenters >── presenters
  │         ╲──< event_categories >── categories ──────────────╯
  ├──< categories                       (sessions.category_id)
  └──< presenters
```

- **users → events**: one-to-many (cascade delete)
- **users → categories**: one-to-many (cascade delete)
- **users → presenters**: one-to-many (cascade delete)
- **events → tracks**: one-to-many (cascade delete)
- **events → sessions**: one-to-many (cascade delete)
- **events ↔ categories**: many-to-many via `event_categories` (cascade delete)
- **sessions → track**: many-to-one (set null on delete)
- **sessions → category**: many-to-one (set null on delete)
- **sessions ↔ presenters**: many-to-many via `session_presenters` (cascade delete)

---

## Development

```bash
npm run db:push      # Push schema changes to local DB
npm run db:seed      # Seed with demo data (demo@slate.dev / password1)
npm run db:generate  # Generate migration files
npm run db:studio    # Open Drizzle Studio
```

**Connection:** `DATABASE_URL` in `.env` — points to local Postgres.app in dev.
