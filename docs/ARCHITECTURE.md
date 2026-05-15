# Architecture Decisions

Record important technical decisions here as the project evolves.
Each entry should include: context, decision, and consequences.

---

## ADR-001: Initial Tech Stack

- **Date:** 2026-05-15
- **Context:** Building an event schedule management tool (Slate) for organizers of 1-3 day events
- **Decision:** Next.js 15+ (App Router) with Drizzle ORM + PostgreSQL, deployed via Docker Compose on Dokploy
- **Consequences:** Full-stack TypeScript, simple deployment pipeline, HTTPS via Let's Encrypt, standalone output for small container images

## ADR-002: Custom Calendar Grid

- **Date:** 2026-05-15
- **Context:** The drag-and-drop calendar is the core feature. Evaluated FullCalendar (paid license, opinionated styling), React Big Calendar (weak DnD), and custom-built options.
- **Decision:** Custom-built calendar using dnd-kit for drag interactions. Vertical time axis, tracks as columns, 5-min snap, 30-min grid lines.
- **Consequences:** Full control over look and feel (critical for the "modern, minimal" design goal), more upfront engineering investment, no third-party licensing constraints

## ADR-003: Local File Storage

- **Date:** 2026-05-15
- **Context:** Need to store presenter photos. Options: S3 or local filesystem.
- **Decision:** Local file storage on the Dokploy server
- **Consequences:** Simpler setup, no AWS S3 dependency, files tied to the server. Can migrate to S3 later if needed.

## ADR-005: shadcn/ui for Component Library

- **Date:** 2026-05-15
- **Context:** Need UI primitives (buttons, inputs, modals, tabs, etc.). Options: build from scratch, use a full component library (MUI, Chakra), or use shadcn/ui (copy-paste, unstyled primitives).
- **Decision:** Use shadcn/ui. Components are copied into the project (not an npm dependency), giving full control over styling. Custom components only for things shadcn/ui doesn't cover (AvatarStack, DragHandle, ColorPicker).
- **Consequences:** Faster to build Phase 1, consistent accessibility out of the box, full control over look and feel since components are local source code, no version lock-in

## ADR-004: No Attendee Auth

- **Date:** 2026-05-15
- **Context:** Attendees need to view event schedules but don't need accounts.
- **Decision:** Unlisted shareable links with no attendee authentication. Events have draft/published toggle.
- **Consequences:** Zero friction for attendees, organizer controls distribution by sharing the link, no attendee data to manage or protect
