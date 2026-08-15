import {
  deleteSessionByTitle,
  expect,
  login,
  openEventEditor,
  openNewSessionPanel,
  submitSession,
  test,
  UUID_RE,
} from './fixtures';

const TITLE = 'E2E Keynote';
const RENAMED = 'E2E Keynote (renamed)';

test.describe('Session CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await openEventEditor(page);
  });

  test.afterEach(async ({ page }) => {
    await deleteSessionByTitle(page, TITLE);
    await deleteSessionByTitle(page, RENAMED);
    await deleteSessionByTitle(page, 'E2E Overlapping');
  });

  test('clicking an empty slot opens a prefilled New session panel', async ({ page }) => {
    await openNewSessionPanel(page);

    await expect(page.locator('input[name="title"]')).toHaveValue('');
    // Click position is translated into a start time snapped to 15 minutes.
    const start = await page.inputValue('input[name="startTime"]');
    expect(start).toMatch(/^\d{2}:(00|15|30|45)$/);
    // The default duration is one hour.
    const end = await page.inputValue('input[name="endTime"]');
    const minutes = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));
    expect(minutes(end) - minutes(start)).toBe(60);
  });

  test('creates a session and renders it on the grid', async ({ page }) => {
    await openNewSessionPanel(page);
    await submitSession(page, TITLE);

    await expect(page.getByTestId('session-card').filter({ hasText: TITLE })).toBeVisible();
  });

  test('shows track and category names in the selects, not raw ids', async ({ page }) => {
    await openNewSessionPanel(page);
    await submitSession(page, TITLE);

    await page.getByTestId('session-card').filter({ hasText: TITLE }).first().click();
    await expect(page.getByRole('heading', { name: 'Edit session' })).toBeVisible();

    const triggers = await page.locator('[data-slot="select-trigger"]').allTextContents();
    expect(triggers.length).toBeGreaterThan(0);
    for (const label of triggers) {
      expect(label, `select trigger should not show a raw id: ${label}`).not.toMatch(UUID_RE);
    }
  });

  test('edits a session title and persists it', async ({ page }) => {
    await openNewSessionPanel(page);
    await submitSession(page, TITLE);

    await page.getByTestId('session-card').filter({ hasText: TITLE }).first().click();
    await page.fill('input[name="title"]', RENAMED);
    await page.getByRole('button', { name: 'Save changes' }).click();

    await expect(page.getByTestId('session-card').filter({ hasText: RENAMED })).toBeVisible();

    await page.reload();
    await expect(page.getByTestId('session-card').filter({ hasText: RENAMED })).toBeVisible();
  });

  test('rejects a session that overlaps another in the same track', async ({ page }) => {
    await openNewSessionPanel(page);
    await submitSession(page, TITLE);
    await expect(page.getByTestId('session-card').filter({ hasText: TITLE })).toBeVisible();

    await openNewSessionPanel(page);
    await submitSession(
      page,
      'E2E Overlapping',
      { end: '23:00', start: '22:30' },
      {
        expectClose: false,
      },
    );

    await expect(page.getByText(/Overlaps ".*" in this track/)).toBeVisible();
    await expect(
      page.getByTestId('session-card').filter({ hasText: 'E2E Overlapping' }),
    ).toHaveCount(0);
  });

  test('rejects an end time that is not after the start time', async ({ page }) => {
    await openNewSessionPanel(page);
    await submitSession(page, TITLE, { end: '22:00', start: '23:00' }, { expectClose: false });

    await expect(page.getByText('End time must be after start time')).toBeVisible();
  });

  test('deletes a session', async ({ page }) => {
    await openNewSessionPanel(page);
    await submitSession(page, TITLE);
    const card = page.getByTestId('session-card').filter({ hasText: TITLE });
    await expect(card).toBeVisible();

    page.once('dialog', (dialog) => dialog.accept());
    await card.first().click();
    await page.getByRole('button', { name: 'Delete session' }).click();

    await expect(card).toHaveCount(0);
    await page.reload();
    await expect(page.getByTestId('session-card').filter({ hasText: TITLE })).toHaveCount(0);
  });
});
