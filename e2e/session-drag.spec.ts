import {
  cardTimeRange,
  deleteSessionByTitle,
  dragSessionBy,
  expect,
  login,
  openEventEditor,
  openNewSessionPanel,
  scrollToHour,
  submitSession,
  test,
  waitForMoveSaved,
} from './fixtures';

const TITLE = 'E2E Draggable';
const NEIGHBOUR = 'E2E Neighbour';
/** One hour, in pixels — must match HOUR_HEIGHT in calendar-grid.tsx. */
const HOUR = 60;

test.describe('Session drag-and-drop', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await openEventEditor(page);
  });

  test.afterEach(async ({ page }) => {
    await deleteSessionByTitle(page, TITLE);
    await deleteSessionByTitle(page, NEIGHBOUR);
  });

  test('drags a session to a later time and persists it', async ({ page }) => {
    await openNewSessionPanel(page);
    await submitSession(page, TITLE, { end: '20:00', start: '19:00' });
    await expect(page.getByTestId('session-card').filter({ hasText: TITLE })).toBeVisible();

    await scrollToHour(page, 18);
    expect(await cardTimeRange(page, TITLE)).toBe('19:00 – 20:00');

    await dragSessionBy(page, TITLE, HOUR);

    // Duration is preserved; only the start moves.
    await expect.poll(() => cardTimeRange(page, TITLE), { timeout: 10_000 }).toBe('20:00 – 21:00');
    await waitForMoveSaved(page);

    await page.reload();
    await scrollToHour(page, 19);
    expect(await cardTimeRange(page, TITLE)).toBe('20:00 – 21:00');
  });

  test('snaps a partial drag to the 5-minute grid', async ({ page }) => {
    await openNewSessionPanel(page);
    await submitSession(page, TITLE, { end: '20:00', start: '19:00' });
    await scrollToHour(page, 18);

    // 7px ≈ 7 minutes, which must land on a 5-minute boundary.
    await dragSessionBy(page, TITLE, 7);

    await expect
      .poll(() => cardTimeRange(page, TITLE), { timeout: 10_000 })
      .toMatch(/^\d{2}:(00|05|10|15|20|25|30|35|40|45|50|55) –/);
    await waitForMoveSaved(page);
  });

  test('refuses a drag that would overlap another session in the track', async ({ page }) => {
    await openNewSessionPanel(page);
    await submitSession(page, TITLE, { end: '20:00', start: '19:00' });
    await openNewSessionPanel(page);
    await submitSession(page, NEIGHBOUR, { end: '21:00', start: '20:00' });

    await scrollToHour(page, 18);
    await dragSessionBy(page, TITLE, HOUR / 2);

    await expect(page.getByText(/would overlap/)).toBeVisible();
    // The card stays put.
    expect(await cardTimeRange(page, TITLE)).toBe('19:00 – 20:00');
  });

  test('undoes a move', async ({ page }) => {
    await openNewSessionPanel(page);
    await submitSession(page, TITLE, { end: '20:00', start: '19:00' });
    await scrollToHour(page, 18);

    await dragSessionBy(page, TITLE, HOUR);
    await expect.poll(() => cardTimeRange(page, TITLE), { timeout: 10_000 }).toBe('20:00 – 21:00');
    await waitForMoveSaved(page);

    await page.getByRole('button', { name: 'Undo' }).click();

    await expect.poll(() => cardTimeRange(page, TITLE), { timeout: 10_000 }).toBe('19:00 – 20:00');
  });

  test('rings the card that is open in the editor', async ({ page }) => {
    await openNewSessionPanel(page);
    await submitSession(page, TITLE, { end: '20:00', start: '19:00' });
    await scrollToHour(page, 18);

    const card = page.getByTestId('session-card').filter({ hasText: TITLE }).first();
    await expect(card).not.toHaveClass(/ring-2/);

    await card.click();
    await expect(page.getByRole('heading', { name: 'Edit session' })).toBeVisible();
    await expect(card).toHaveClass(/ring-2/);
  });

  test('keeps the drawn range outlined while the New session panel is open', async ({ page }) => {
    await scrollToHour(page, 5);

    const column = page.getByTestId('track-column').first();
    const box = (await column.boundingBox())!;
    const x = box.x + box.width / 2;

    await page.mouse.move(x, box.y + 6 * HOUR);
    await page.mouse.down();
    await page.mouse.move(x, box.y + 7 * HOUR, { steps: 10 });
    await page.mouse.up();

    await expect(page.getByRole('heading', { name: 'New session' })).toBeVisible();
    // The outline survives the drag so you can see what you selected.
    await expect(page.getByTestId('pending-range')).toBeVisible();
  });

  test('drag-selecting empty grid opens a New session with that range', async ({ page }) => {
    await scrollToHour(page, 5);

    const column = page.getByTestId('track-column').first();
    const box = (await column.boundingBox())!;
    const x = box.x + box.width / 2;
    // 06:00 → 07:30
    const fromY = box.y + 6 * HOUR;
    const toY = box.y + 7.5 * HOUR;

    await page.mouse.move(x, fromY);
    await page.mouse.down();
    await page.mouse.move(x, toY, { steps: 10 });
    await page.mouse.up();

    await expect(page.getByRole('heading', { name: 'New session' })).toBeVisible();
    expect(await page.inputValue('input[name="startTime"]')).toBe('06:00');
    expect(await page.inputValue('input[name="endTime"]')).toBe('07:30');
  });
});
