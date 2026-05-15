<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Slate Project Guidelines

## Code Quality

- **Reusability first**: Extract shared logic into `src/lib/utils.ts` or reusable components. Never duplicate utility functions — check `utils.ts` before writing inline helpers.
- **Tests for utils**: Every utility function in `src/lib/` must have corresponding tests in `src/__tests__/`. Run `npm test` before committing.
- **Consistent UI**: Use shadcn/ui components. Don't hardcode `rounded-lg` — use `rounded-md` to match the project's radius (`0.375rem`). When shadcn reinstalls components, check for `rounded-lg` regressions.
- **Base-nova style**: shadcn uses `@base-ui/react` (not Radix) for most components. Key differences: no `asChild` prop — use `render` prop instead. `DropdownMenuItem` uses `onClick` not `onSelect`.
- **Controlled inputs**: Base UI warns on uncontrolled-to-controlled switches. Always use `value` + `onChange` (not `defaultValue`) for inputs bound to URL params or state.

## Architecture

- **Server Actions** go in `src/lib/*-actions.ts` (files with `'use server'`)
- **Queries** (read-only data fetching) go in `src/lib/*-queries.ts` (with `import 'server-only'`)
- **Never mix** server actions and queries in the same file — actions can't be called during server component render
- **DB connection**: Uses `globalThis` singleton pattern in `src/db/index.ts` to prevent connection exhaustion during dev hot reloads

## Conventions

- Format: `npx prettier --write`
- Lint: `npx eslint src/ --fix`
- Always format and lint before committing
- Use `grid gap-*` for form layouts, `space-y-*` for vertical lists
- Label + input groups use `grid gap-1.5`
- Dialog forms use `grid gap-4` with `DialogFooter` for submit button
- Deploy: ask the user to run `python3 scripts/deploy.py` — do NOT make API calls to dok.msalia.org directly (sandbox blocks it)
