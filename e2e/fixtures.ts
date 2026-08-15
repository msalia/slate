import { test as base, expect, type Page } from '@playwright/test';

/**
 * These specs run against the real dev server and the local Postgres container —
 * server actions can't be meaningfully stubbed at the network layer. Every test
 * creates its own sessions in an out-of-the-way time slot and deletes them again,
 * so the seeded data is left untouched.
 */
export const CREDENTIALS = {
  email: process.env.E2E_EMAIL ?? 'demo@slate.dev',
  password: process.env.E2E_PASSWORD ?? 'password1',
};

/** Late-evening window the seed data never occupies. */
export const FREE_SLOT = { end: '23:30', start: '22:00' };

/** Must match HOUR_HEIGHT in calendar-grid.tsx. */
const HOUR_HEIGHT = 60;

/** An early-morning hour with nothing on it, so slot clicks never land on a card. */
const EMPTY_HOUR = 6;

export const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

export async function login(page: Page) {
  await page.goto('/login');
  await page.fill('input[name="email"]', CREDENTIALS.email);
  await page.fill('input[name="password"]', CREDENTIALS.password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard');
}

/** Opens the first event that has at least one track, since sessions need a column. */
export async function openEventEditor(page: Page) {
  await page.goto('/dashboard');
  const hrefs = await page
    .locator('a[href*="/events/"][href$="/edit"]')
    .evaluateAll((links) => links.map((l) => l.getAttribute('href')!));

  expect(hrefs.length, 'dashboard should list at least one event').toBeGreaterThan(0);

  for (const href of hrefs) {
    await page.goto(href);
    await page.waitForLoadState('networkidle');
    if ((await page.getByTestId('track-column').count()) > 0) {
      return href;
    }
  }

  throw new Error('No event with tracks found — add a track before running these specs.');
}

/**
 * Clicks empty space in a track column to open the "New session" panel.
 *
 * The column is a full 24h tall (1440px), so most of it sits outside the
 * viewport: `mouse.click` takes viewport coordinates and would miss entirely.
 * Scroll the target hour into view first, then read the box back — bounding
 * boxes are viewport-relative, so the arithmetic stays honest.
 */
export async function openNewSessionPanel(page: Page, hour: number = EMPTY_HOUR) {
  await page.getByTestId('calendar-scroll').evaluate(
    (el, top) => {
      el.scrollTop = top;
    },
    Math.max(0, (hour - 1) * HOUR_HEIGHT),
  );

  const column = page.getByTestId('track-column').first();
  const box = (await column.boundingBox())!;
  await page.mouse.click(box.x + box.width / 2, box.y + hour * HOUR_HEIGHT + 10);

  await expect(page.getByRole('heading', { name: 'New session' })).toBeVisible();
}

/**
 * Fills and submits the session form.
 *
 * By default this waits for the panel to close, which is the only reliable
 * signal that the action resolved: returning early lets the next interaction
 * race the pending `onDone()`, which would then close the panel it just opened.
 * Pass `expectClose: false` when the submission is meant to be rejected.
 */
export async function submitSession(
  page: Page,
  title: string,
  slot: { end: string; start: string } = FREE_SLOT,
  { expectClose = true }: { expectClose?: boolean } = {},
) {
  await page.fill('input[name="title"]', title);
  await page.fill('input[name="startTime"]', slot.start);
  await page.fill('input[name="endTime"]', slot.end);
  await page.click('button[type="submit"]');

  if (expectClose) {
    await expect(page.getByRole('heading', { name: /^(New|Edit) session$/ })).toHaveCount(0, {
      timeout: 10_000,
    });
  }
  return title;
}

/** Scrolls so `hour` sits near the top of the grid viewport. */
export async function scrollToHour(page: Page, hour: number) {
  await page.getByTestId('calendar-scroll').evaluate(
    (el, top) => {
      el.scrollTop = top;
    },
    Math.max(0, (hour - 1) * HOUR_HEIGHT),
  );
}

/**
 * Drags a session card by its handle. `deltaY` is in pixels — one hour is
 * HOUR_HEIGHT. Steps matter: dnd-kit needs several pointermove events to pass
 * its activation constraint and register a drop target.
 */
export async function dragSessionBy(page: Page, title: string, deltaY: number, deltaX: number = 0) {
  const card = page.getByTestId('session-card').filter({ hasText: title }).first();
  await card.hover();
  const handle = card.getByTestId('session-drag-handle');
  const box = (await handle.boundingBox())!;
  const fromX = box.x + box.width / 2;
  const fromY = box.y + box.height / 2;

  await page.mouse.move(fromX, fromY);
  await page.mouse.down();
  await page.mouse.move(fromX + deltaX / 2, fromY + deltaY / 2, { steps: 10 });
  await page.mouse.move(fromX + deltaX, fromY + deltaY, { steps: 10 });
  await page.mouse.up();

  // dnd-kit's PointerSensor stops every document click at capture phase while a
  // drag is active, and only removes that listener 50ms after the drag ends
  // (`setTimeout(documentListeners.removeAll, 50)` in its `detach`). Clicking
  // inside that window silently does nothing, so wait it out. There is no
  // observable signal for it — hence a fixed wait rather than a poll.
  await page.waitForTimeout(150);
}

/**
 * Waits for a move to be confirmed by the server. The optimistic update paints
 * immediately, so asserting on the card alone and then reloading would abort
 * the in-flight action — the "Undo" affordance only appears once it resolves.
 */
export async function waitForMoveSaved(page: Page) {
  await expect(page.getByRole('button', { name: 'Undo' })).toBeVisible({ timeout: 10_000 });
}

/** Reads a card's rendered time range, e.g. "22:00 – 23:30". */
export async function cardTimeRange(page: Page, title: string) {
  const card = page.getByTestId('session-card').filter({ hasText: title }).first();
  return (await card.textContent())?.match(/\d{2}:\d{2}\s*–\s*\d{2}:\d{2}/)?.[0] ?? null;
}

export async function deleteSessionByTitle(page: Page, title: string) {
  const card = page.getByTestId('session-card').filter({ hasText: title });
  if ((await card.count()) === 0) {
    return;
  }

  // Retry opening the panel: a click can be swallowed (see dragSessionBy), and
  // cleanup that silently gives up would poison every later test.
  const heading = page.getByRole('heading', { name: 'Edit session' });
  for (let attempt = 0; attempt < 3; attempt++) {
    await card.first().click();
    try {
      await heading.waitFor({ state: 'visible', timeout: 2_000 });
      break;
    } catch {
      if (attempt === 2) {
        throw new Error(`Could not open the editor for "${title}" to clean it up`);
      }
    }
  }

  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Delete session' }).click();
  await expect(card).toHaveCount(0);
}

export const test = base;
export { expect } from '@playwright/test';
