# Implementation Plan

Step-by-step build order for Slate v1. Each phase builds on the previous one. Phases are designed so the app is functional at the end of each — no half-built states.

---

## Phase 1: Design System & App Shell

Establish the visual foundation and layout before building features. Everything after this inherits the look and feel.

### 1.1 — shadcn/ui Setup & Tailwind Theme

- [x] Initialize shadcn/ui: manual setup with `components.json`, Radix primitives, CVA, `cn()` utility
- [x] Configure Tailwind theme via CSS variables: OKLCH color palette (soft accents, 8 category colors), border-radius tokens, shadow scale
- [x] Set base font (Inter via `next/font`)
- [x] Global styles: semantic background/foreground via CSS variables
- [x] Dark mode: full light/dark/system support via `next-themes`

### 1.2 — UI Components (shadcn/ui + Custom)

Install shadcn/ui primitives and customize their styles to match the Slate design system. Build custom components only where shadcn/ui doesn't cover the need.

**From shadcn/ui** (install and customize):

- [x] `Button` — customize variants: primary (filled), secondary (outlined), destructive, ghost, link + sizes
- [x] `Input` / `Textarea` — rounded-lg, subtle border, focus ring
- [x] `Select` — rounded, consistent with inputs
- [x] `Dialog` / `Sheet` — Sheet for slide-out side panel (session editing)
- [x] `Card` — white/card bg, subtle border + shadow, rounded-xl
- [x] `Badge` — soft background pill labels
- [x] `Tabs` — pill-shaped toggle group (active = filled, inactive = ghost)
- [x] `Avatar` — circular image with fallback initials
- [x] `Switch` — on/off toggle for draft/published
- [x] `Dropdown Menu` — for context menus and actions
- [x] `Popover` — for inline presenter creation, color pickers
- [ ] `Command` — for autocomplete/search (presenter picker) — deferred to Phase 6
- [x] `Separator` — for clean dividers
- [x] `Skeleton` — for loading states
- [x] `Tooltip` — for icon-only actions
- [x] `Label` — form labels
- [x] `ScrollArea` — custom scrollbar areas

**Custom components** (not in shadcn/ui):

- [x] `AvatarStack` — overlapping face pile for multiple presenters
- [x] `DragHandle` — 6-dot grid icon for reorderable items
- [x] `EmptyState` — illustration + message + CTA for empty lists
- [x] `ColorPicker` — predefined palette of soft colors for categories

### 1.3 — App Layout

- [x] Sidebar navigation: fixed left, icons + labels, clean dividers between sections
  - Dashboard, Events, Presenters, Settings
  - Bottom: theme toggle (light/dark/system). User avatar + sign out deferred to Phase 2 (auth).
- [x] Main content area: flex-grow, scrollable
- [x] Top bar: page title + action slot
- [x] Side panel slot: right-side drawer component for session editing, previews
- [x] Route groups: `(app)` for authenticated pages, `(auth)` for login/signup

---

## Phase 2: Auth

### 2.1 — Database Schema (Auth)

- [x] `users` table: id (uuid), email (unique), name, password_hash (nullable for OAuth), avatar_url, created_at, updated_at

### 2.2 — Auth Pages

- [x] `/login` — email + password form, link to sign up. Google OAuth button deferred.
- [x] `/signup` — name, email, password form, link to login. Google OAuth button deferred.
- [x] `/settings` — account settings: update name, change password, delete account
- [x] All pages follow design system — centered card on soft background, rounded inputs

### 2.3 — Auth Logic

- [x] Custom auth with `jose` (JWT) + `bcryptjs` — simpler than NextAuth for this use case. Google OAuth can be added later.
- [x] Password hashing with bcryptjs (10 rounds)
- [x] Stateless JWT sessions in httpOnly cookies (7-day expiry)
- [x] `proxy.ts` route protection — redirects unauthenticated users to `/login`, authenticated users away from auth pages
- [x] Data Access Layer (DAL) with `verifySession()` and `getUser()` using React `cache()`
- [x] Zod validation schemas for all forms
- [x] Hard account deletion: delete user row (cascade to be wired in Phase 3 when other tables exist)
- [x] Sidebar shows user avatar (initials) + name + logout button

---

## Phase 3: Data Model

### 3.1 — Drizzle Schema

All tables. Foreign keys and indexes.

```
users
  id, email, name, password_hash, avatar_url, created_at, updated_at

events
  id, user_id (FK users), name, slug (unique), description,
  start_date, end_date, timezone, status (draft/published),
  created_at, updated_at

tracks
  id, event_id (FK events), name, position (for column ordering)

categories
  id, user_id (FK users), name, color, created_at

event_categories (junction — which categories are used in which event)
  event_id (FK events), category_id (FK categories)

presenters
  id, user_id (FK users), name, role, photo_path, created_at

sessions
  id, event_id (FK events), track_id (FK tracks, nullable),
  category_id (FK categories, nullable),
  title, description, start_time (timestamp), end_time (timestamp),
  is_break (boolean, default false), position, created_at, updated_at

session_presenters (junction)
  session_id (FK sessions), presenter_id (FK presenters)
```

### 3.2 — Migrations

- [x] Schema pushed via `drizzle-kit push` against local PostgreSQL (Postgres.app)
- [x] All 8 tables created: users, events, tracks, categories, event_categories, presenters, sessions, session_presenters
- [x] Seed script (`npm run db:seed`) — demo user, 1 event, 2 tracks, 3 categories, 3 presenters, 4 sessions with junction data
- [x] All foreign keys with cascade deletes, junction tables with composite primary keys, Drizzle relations defined

---

## Phase 4: Organizer Dashboard

### 4.1 — Event List Page (`/dashboard`)

- [x] Fetch all events for the logged-in user with session count (LEFT JOIN + GROUP BY)
- [x] Card grid layout: event name, date range, session count, draft/published badge
- [x] "Create Event" button in top bar + center empty state
- [x] Empty state for first-time users: calendar icon + "No events yet" + CTA
- [x] Click card → navigate to `/events/[slug]/edit`

### 4.2 — Create Event Flow

- [x] Dialog with minimal form: name, start date, end date, timezone (hidden, auto-detected)
- [x] Auto-generate slug from name (kebab-case, uniqueness check with suffix)
- [x] Default timezone to browser timezone via `Intl.DateTimeFormat`
- [x] On submit → create event + redirect to calendar editor
- [x] Zod validation, date ordering check

### 4.3 — Event Settings

- [x] Settings sheet (right slide-out) in the event editor, accessible via gear icon
- [x] Edit: name, date range, timezone, description (textarea, rich text deferred)
- [x] Draft/published toggle with Switch + Badge
- [x] Shareable link display with copy button — only shown when published
- [x] Delete event with confirmation dialog

---

## Phase 5: Track & Category Management

### 5.1 — Track Management

- [x] Manage tracks in right sidebar panel of the event editor
- [x] Add track: input + "+" button, appends at end
- [x] Edit track name: inline input, saves on blur
- [x] Reorder tracks: server action ready (`reorderTracks`), drag UI deferred to Phase 7
- [x] Delete track: blocked if sessions are assigned, shows error message

### 5.2 — Category Management

- [x] Manage categories in right sidebar panel of the event editor
- [x] Add category: name + color picker (8-color predefined palette)
- [x] Remove category from event (unlink, not delete)
- [x] Categories scoped to user, associated per-event via junction table
- [x] Reuse categories across events — "Add existing category" section shows unassigned categories
- [x] Color swatches displayed next to each category name

---

## Phase 6: Presenter Management

### 6.1 — Presenter Roster Page (`/presenters`)

- [x] List all presenters for the logged-in user with session count
- [x] Card grid: avatar (initials), name, role, session count
- [x] Add presenter via dialog: name + role (no photo upload — using initials avatars)
- [x] Inline edit (name + role) and delete with confirmation
- [x] Search/filter by name

### 6.2 — Inline Presenter Assignment

- [ ] In the session editor (side panel), a "Presenters" field — deferred to Phase 7
- [ ] Autocomplete from existing roster — deferred to Phase 7
- [ ] Multi-select — deferred to Phase 7
- [x] Display as avatar face pile on event cards (dashboard)

### 6.3 — File Upload (Photos)

- Skipped — using initials-based avatars instead

---

## Phase 7: Calendar Editor

The core feature. Build incrementally — get the grid rendering first, then add interactions.

### 7.1 — Calendar Grid (Static)

- [ ] Time axis: vertical, top-to-bottom, hours on the left margin
- [ ] 30-minute grid lines (thin, subtle — `border-gray-100` or similar)
- [ ] Hour labels: `08:00`, `09:00`, etc. — range based on event's first/last session (or default 8am-6pm)
- [ ] Track columns: each track is a column, header row shows track name
- [ ] Day headers: date label at the top of each day's column group
- [ ] Day navigation: tabs for multi-day events, show 1-3 days at once, horizontal scroll for more
- [ ] Current time indicator: red/accent horizontal line spanning all columns
- [ ] Responsive: minimum column width, horizontal scroll when tracks overflow

### 7.2 — Session Rendering

- [ ] Render sessions as cards positioned on the grid
- [ ] Position: top offset = start time, height = duration (proportional to time)
- [ ] Card style: white bg, full colored border (category color), rounded-lg, subtle shadow
- [ ] Card content: bold title, time range (`09:00 - 10:30`), description snippet (1 line, truncated), presenter face pile
- [ ] Break blocks: hatched/striped background pattern, muted colors, distinct from sessions

### 7.3 — Session CRUD (Side Panel)

- [ ] Click empty time slot → open side panel with "New Session" form
- [ ] Click existing session → open side panel with edit form
- [ ] Form fields: title, start time, end time (time pickers with minute precision), track (dropdown), category (dropdown with color swatches), description (rich text), presenters (autocomplete multi-select), is-break toggle
- [ ] Save / Cancel / Delete buttons
- [ ] Auto-save or explicit save — decide during build
- [ ] Optimistic UI updates — card appears/updates immediately, syncs to server

### 7.4 — Drag-and-Drop

- [ ] Install `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities`
- [ ] Drag to move: pick up a session card, move to a different time slot or track
- [ ] Snap to 5-minute intervals while dragging
- [ ] Visual feedback: ghost card at new position, original card dimmed
- [ ] Drop → update start/end time and track, persist to database
- [ ] Click-and-drag on empty grid to create a new session (drag defines the time range)
- [ ] Collision detection: prevent overlapping sessions in the same track

### 7.5 — Polish & Interactions

- [ ] Smooth transitions on card move/resize (CSS transitions or Framer Motion)
- [ ] Keyboard accessibility: arrow keys to navigate, Enter to select/edit
- [ ] Undo last action (optional stretch goal)
- [ ] Auto-scroll when dragging near grid edges

---

## Phase 8: Attendee View

### 8.1 — Public Event Page (`/e/[slug]`)

- [ ] Fetch event by slug — 404 if not found or still in draft
- [ ] Event header: name, date range, timezone, description
- [ ] No auth required — fully public (unlisted)

### 8.2 — Schedule Grid (Read-Only)

- [ ] Same calendar grid layout as the editor, without drag-and-drop or editing
- [ ] Session cards: same styling (colored border, title, time, presenters)
- [ ] Click session → modal/drawer with full details (description, presenter bios, etc.)
- [ ] "Happening now" indicator: highlight sessions whose time range includes the current time (client-side, updates every minute)

### 8.3 — Filtering

- [ ] Filter bar above the grid: dropdowns or pill toggles for track, category, presenter
- [ ] Filters are combinable (AND logic)
- [ ] Active filters shown as removable pills
- [ ] Filtered-out sessions dim or hide (decide during build)

### 8.4 — Mobile Layout

- [ ] Below breakpoint (768px), switch from grid to chronological list
- [ ] Group sessions by time slot
- [ ] Track shown as a colored badge on each session card
- [ ] Same filtering controls, adapted to mobile (collapsible filter drawer)
- [ ] Session detail via full-screen modal on mobile

---

## Phase 9: Export

### 9.1 — iCalendar Export

- [ ] `/api/events/[slug]/export` — generates `.ics` file with all sessions
- [ ] Each session becomes a VEVENT with: summary (title), dtstart, dtend, location (track name), description, organizer
- [ ] Timezone handling: use event timezone for all VEVENT times
- [ ] "Download Full Schedule" button on both organizer and attendee views

### 9.2 — Per-Session Export

- [ ] "Add to Calendar" button on each session card/detail view
- [ ] Generates a single-event `.ics` file for that session
- [ ] Works on both organizer and attendee views

### 9.3 — Print View

- [ ] `/e/[slug]/print` — clean, print-optimized layout
- [ ] No interactive elements, no sidebar, no navigation
- [ ] Linear timetable: sessions grouped by day, then by time, with track labels
- [ ] CSS `@media print` stylesheet: hide browser chrome, clean page breaks
- [ ] "Print Schedule" button on both views → opens print dialog

---

## Phase 10: Marketing Landing Page

### 10.1 — Landing Page (`/`)

- [x] Hero section: headline ("Event schedules, built visually."), subheadline, "Get Started Free" + "Read the Docs" CTAs
- [x] Feature section: 6 cards with icons (Visual Schedule Builder, Category Color-Coding, Presenter Management, Shareable Attendee View, Calendar Export, Draft & Publish)
- [ ] Optional: screenshot or mockup of the calendar editor — deferred until Phase 7 is built
- [x] Footer: minimal — Documentation, Sign in, Sign up links
- [x] Header: logo + Sign in / Get Started buttons
- [x] Fully responsive (flexbox/grid, stacks on mobile)
- [x] If user is already logged in, redirect to `/dashboard`
- [x] Proxy updated to allow `/` as public route

---

## Phase 11: Polish & Hardening

### 11.1 — Error Handling

- [ ] Form validation with clear error messages (inline, not alerts)
- [ ] API error boundaries — graceful fallback UI
- [ ] 404 page (custom, matches design system)
- [ ] Loading states: skeleton loaders on dashboard cards, calendar grid

### 11.2 — Performance

- [ ] Calendar grid: virtualize if needed (only render visible time range)
- [ ] Image optimization: resize presenter photos on upload (thumbnail + full)
- [ ] Lazy load below-the-fold content on landing page
- [ ] Database indexes on hot queries: events by user_id, sessions by event_id, slug lookups

### 11.3 — SEO & Meta

- [ ] Page titles and meta descriptions for all pages
- [ ] Open Graph tags on the public event page (event name, description)
- [ ] Favicon and app icon

### 11.4 — Testing

- [ ] Unit tests: data model helpers, slug generation, time calculations
- [ ] Component tests: session card rendering, filter logic, export generation
- [ ] Integration tests: auth flow, event CRUD, session CRUD
- [ ] E2E test: create account → create event → add sessions → publish → view public page

---

## Dependency Graph

```
Phase 1 (Shell)
  └── Phase 2 (Auth)
        └── Phase 3 (Data Model)
              ├── Phase 4 (Dashboard)
              │     └── Phase 5 (Tracks & Categories)
              │           └── Phase 7 (Calendar Editor)
              ├── Phase 6 (Presenters)
              │     └── Phase 7 (Calendar Editor)
              └── Phase 7 (Calendar Editor)
                    ├── Phase 8 (Attendee View)
                    └── Phase 9 (Export)

Phase 10 (Landing Page) — independent, can be built anytime
Phase 11 (Polish) — ongoing, intensifies after Phase 8
```

---

## File Structure (Target)

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (app)/
│   │   ├── layout.tsx              # Sidebar + main content layout
│   │   ├── dashboard/page.tsx
│   │   ├── events/
│   │   │   └── [slug]/
│   │   │       └── edit/page.tsx   # Calendar editor
│   │   ├── presenters/page.tsx
│   │   └── settings/page.tsx
│   ├── e/
│   │   └── [slug]/
│   │       ├── page.tsx            # Public attendee view
│   │       └── print/page.tsx      # Print-friendly layout
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── events/
│   │   │   ├── route.ts            # CRUD
│   │   │   └── [slug]/
│   │   │       └── export/route.ts # .ics export
│   │   ├── sessions/route.ts
│   │   ├── presenters/route.ts
│   │   ├── categories/route.ts
│   │   ├── tracks/route.ts
│   │   ├── upload/route.ts         # File uploads
│   │   └── health/route.ts
│   ├── layout.tsx                  # Root layout
│   └── page.tsx                    # Landing page
├── components/
│   ├── ui/                         # Design system primitives
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── modal.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── tabs.tsx
│   │   ├── avatar.tsx
│   │   ├── avatar-stack.tsx
│   │   ├── toggle.tsx
│   │   ├── drag-handle.tsx
│   │   └── empty-state.tsx
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   ├── top-bar.tsx
│   │   └── side-panel.tsx
│   ├── calendar/
│   │   ├── calendar-grid.tsx       # Main grid container
│   │   ├── time-axis.tsx           # Hour labels column
│   │   ├── track-column.tsx        # Single track column
│   │   ├── track-header.tsx        # Column header with track name
│   │   ├── day-header.tsx          # Date label row
│   │   ├── session-card.tsx        # Draggable session block
│   │   ├── break-block.tsx         # Hatched break block
│   │   ├── time-indicator.tsx      # "Now" line
│   │   ├── grid-lines.tsx          # Background grid lines
│   │   └── session-editor.tsx      # Side panel form
│   ├── events/
│   │   ├── event-card.tsx
│   │   ├── create-event-modal.tsx
│   │   └── event-settings.tsx
│   ├── presenters/
│   │   ├── presenter-card.tsx
│   │   ├── presenter-picker.tsx    # Autocomplete multi-select
│   │   └── presenter-form.tsx
│   └── attendee/
│       ├── public-grid.tsx         # Read-only calendar
│       ├── filter-bar.tsx
│       ├── session-detail-modal.tsx
│       └── mobile-schedule.tsx
├── db/
│   ├── index.ts
│   └── schema.ts
├── lib/
│   ├── auth.ts                     # Auth config
│   ├── ics.ts                      # iCalendar generation
│   ├── slug.ts                     # Slug generation + uniqueness
│   ├── time.ts                     # Time helpers (snap, format, overlap detection)
│   └── upload.ts                   # File upload helpers
└── __tests__/
```
