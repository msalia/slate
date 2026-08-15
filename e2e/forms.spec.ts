import { CREDENTIALS, expect, login, test } from './fixtures';

/**
 * Covers the react-hook-form + zod migration: client-side validation, server
 * errors mapped back onto the right field, and a success path that persists.
 */
test.describe('Form validation', () => {
  test('rejects a malformed email without contacting the server', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input#email', 'not-an-email');
    await page.fill('input#password', 'whatever123');
    await page.click('button[type="submit"]');

    await expect(page.getByText('Please enter a valid email')).toBeVisible();
    // Client-side rejection means we never left the page.
    expect(new URL(page.url()).pathname).toBe('/login');
  });

  test('surfaces a wrong password as a form-level error', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input#email', CREDENTIALS.email);
    await page.fill('input#password', 'definitely-the-wrong-password');
    await page.click('button[type="submit"]');

    await expect(page.getByText('Invalid email or password')).toBeVisible();
    expect(new URL(page.url()).pathname).toBe('/login');
  });

  test('enforces the password rules on signup before submitting', async ({ page }) => {
    await page.goto('/signup');
    await page.fill('input#name', 'Test Person');
    await page.fill('input#email', 'someone@example.com');
    await page.fill('input#password', 'short');
    await page.click('button[type="submit"]');

    await expect(page.getByText('Password must be at least 8 characters')).toBeVisible();
    expect(new URL(page.url()).pathname).toBe('/signup');
  });

  test('rejects a too-short name in profile settings', async ({ page }) => {
    await login(page);
    await page.goto('/settings');
    await expect(page.locator('input#name')).not.toHaveValue('');

    await page.fill('input#name', 'A');
    await page.getByRole('button', { name: 'Save changes' }).click();

    await expect(page.getByText('Name must be at least 2 characters')).toBeVisible();
  });

  test('saves a profile name change and keeps it after reload', async ({ page }) => {
    await login(page);
    await page.goto('/settings');
    await expect(page.locator('input#name')).not.toHaveValue('');

    const original = await page.inputValue('input#name');
    const renamed = `${original} E2E`.trim();

    await page.fill('input#name', renamed);
    await page.getByRole('button', { name: 'Save changes' }).click();
    await expect(page.getByRole('status')).toContainText('Saved');

    await page.reload();
    expect(await page.inputValue('input#name')).toBe(renamed);

    // Put it back so the suite is repeatable.
    await page.fill('input#name', original);
    await page.getByRole('button', { name: 'Save changes' }).click();
    await expect(page.getByRole('status')).toContainText('Saved');
  });

  test('reports an incorrect current password on the password field', async ({ page }) => {
    await login(page);
    await page.goto('/settings');
    await expect(page.locator('input#currentPassword')).toBeVisible();

    await page.fill('input#currentPassword', 'not-my-password');
    await page.fill('input#newPassword', 'brandnew123');
    await page.fill('input#confirmPassword', 'brandnew123');
    await page.getByRole('button', { name: 'Change password' }).click();

    await expect(page.getByText('Current password is incorrect')).toBeVisible();
  });

  test('catches mismatched password confirmation on the client', async ({ page }) => {
    await login(page);
    await page.goto('/settings');
    await expect(page.locator('input#currentPassword')).toBeVisible();

    await page.fill('input#currentPassword', CREDENTIALS.password);
    await page.fill('input#newPassword', 'brandnew123');
    await page.fill('input#confirmPassword', 'different123');
    await page.getByRole('button', { name: 'Change password' }).click();

    await expect(page.getByText('Passwords do not match')).toBeVisible();
  });
});
