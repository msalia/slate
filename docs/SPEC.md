# Slate — Product Specification (v1)

Event schedule management tool for organizers of single or multi-day events.

---

## Users & Access

- **Primary user:** Single organizer per event (no collaboration in v1)
- **Attendee access:** Read-only via unlisted shareable link, no attendee auth required
- **Auth:** Email/password + Google OAuth, no email verification, hard account deletion
- **Draft/Published toggle:** Organizer controls when the event link goes live

---

## Data Model

### Event

- Name (required)
- Date range — start date / end date (single day = same date for both)
- Timezone
- Description (rich text, editable from event settings)
- Draft/published status
- Shareable slug (e.g., `/e/techconf-2026`)

### Session

- Title (required)
- Start time / end time (minute-level precision)
- Track / location (determines calendar column)
- Description (rich text)
- Category (color-coded, custom per event, reusable across organizer's events)
- Presenter(s) (many-to-many)

### Presenter

- Name (required)
- Role / title
- Photo
- Scoped to organizer's account — personal roster, reusable across events
- Created inline while editing a session (autocomplete from existing roster)
- Multiple presenters per session (displayed as avatar face pile)

### Session Category

- Name
- Color
- Custom per event, reusable across organizer's events
- Drives color-coding on session cards

### Break

- Special session type with distinct visual treatment (hatched/striped pattern)

---

## Organizer Dashboard

- Event card grid: event name, dates, session count, draft/published status
- "Create Event" button
- No stats or analytics in v1
- Click a card to enter the calendar editor

---

## Event Creation

Minimal form to get into the editor fast:

- Event name
- Date range (start / end date)
- Timezone

Description, tracks, and categories are added later from event settings.

---

## Calendar Editor (Core Feature — Custom Built)

### Layout

- Vertical time axis (top to bottom)
- Tracks as columns
- 1-3 day columns visible at once, horizontal scroll for longer events
- Day tabs / date headers at the top of each column

### Grid

- 30-minute grid lines (minimal, not cluttered)
- 5-minute snap intervals for drag-and-drop
- Minute-level precision on manual time input
- Current time indicator: horizontal line across all columns

### Interactions

- Drag-and-drop to create and move sessions
- Click time slot to add a session
- Click session to edit (opens side panel or modal)
- Smooth, delightful, snappy, and performant

### Session Cards

- White/light background
- Full colored border (all sides) driven by session category
- Rounded corners, subtle shadow
- Content: bold title, time range, description snippet, presenter avatar stack (face pile)

### Break Blocks

- Hatched/striped pattern
- Visually distinct from regular sessions

### Track Management

- Tracks addable on the fly via "+" button to add a column
- Tracks represent locations or parallel streams

---

## Design System

### Overall Feel

- Minimal, modern, not cluttered
- Light, airy — lots of whitespace, soft background
- Rounded UI elements throughout — buttons, badges, inputs
- Soft color accents — colored badges for types/status, not heavy color blocks
- Smooth/delightful interactions, snappy and performant

### Navigation

- Clean sidebar navigation with icons
- Pill-shaped tabs/toggles for in-page navigation

### Content Patterns

- Card-based rows with subtle borders and inline actions
- Drag handles (grid dots) where reordering is supported
- Side panel (right side) for preview/details without leaving the main view

### Inspiration

- Admin dashboard UI with pill tabs and card rows (Image 1)
- Color-coded calendar blocks with category-driven fills, break hatching, "now" line (Image 2)
- Multi-day card grid with colored borders, rich content, face piles (Image 3)

---

## Attendee Read-Only View

- **Desktop:** Mirrors calendar grid layout
- **Mobile:** Collapses to chronological list grouped by time slot with track badges
- **Filtering:** By track, category, and presenter
- **Session detail:** Modal/drawer — keeps user in context
- **"Happening now" indicator:** Client-side (compares session times to browser time)
- **No real-time updates:** Standard HTTP, attendees refresh to see changes

---

## Export

Organizer only:

- **Full schedule `.ics`** — all sessions in one iCalendar file
- **Per-session `.ics`** — "Add to Calendar" button on individual sessions
- **Print view** — clean timetable layout, no interactive UI elements

---

## Marketing Landing Page

Simple, minimal:

- Hero section with one-liner
- Feature highlights (2-3 key points)
- "Get Started" CTA to sign up
- No over-investment in copy before there are users

---

## Tech Stack

- **Frontend:** Next.js 15+ (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Database:** Drizzle ORM + PostgreSQL 16
- **Auth:** Email/password + Google OAuth
- **Deployment:** Docker Compose on Dokploy
- **File storage:** Local on server (presenter photos)
- **Domain:** slate.msalia.org (subdomain, dedicated domain later)

---

## Out of Scope for v1

- Collaboration / multi-organizer per event
- Attendee accounts or authentication
- Real-time / WebSocket updates
- Analytics or stats dashboard
- Tags on sessions
- Session status (confirmed/tentative/cancelled)
- Attachments / file uploads on sessions
- Event branding / theming (custom logos, colors)
- Google Calendar / Outlook API integration (`.ics` covers it)
- Public event discovery
- Drag-and-drop is in scope; resize handles are a stretch goal
