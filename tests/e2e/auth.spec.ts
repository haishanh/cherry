import { test, expect, newAccount, createBookmark, getBookmarks, registerAccount } from './fixtures';

test('requires authentication for protected pages and import requests', async ({ page }) => {
  await page.goto('/settings/import');
  await expect(page).toHaveURL(/\/signin$/);
  await expect(page.getByRole('heading', { name: 'Sign in', exact: true })).toBeVisible();
  const response = await page.request.post('/api/import/csv?preview=1', { data: 'url\nhttps://example.test' });
  expect(response.status()).toBe(401);
});

test('registers, signs out, rejects a bad password, and signs back in through the UI', async ({ page }) => {
  const account = newAccount();
  await page.goto('/signup');
  await page.getByLabel('Email', { exact: true }).fill(account.username);
  await page.getByLabel('Password', { exact: true }).fill(account.password);
  await page.getByRole('button', { name: 'Join', exact: true }).click();
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { name: 'No bookmarks found' })).toBeVisible();

  await page.goto('/settings/account');
  await expect(page.getByText(`Signed in as ${account.username}`, { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Sign out', exact: true }).click();
  await expect(page).toHaveURL(/\/signin$/);
  expect((await page.request.get('/api/bookmarks')).status()).toBe(401);

  await page.getByLabel('Email', { exact: true }).fill(account.username);
  await page.getByLabel('Password', { exact: true }).fill('wrong-password');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByText('Sign in failed', { exact: true })).toBeVisible();
  await page.getByLabel('Password', { exact: true }).fill(account.password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL('/');
  await page.reload();
  await expect(page.getByRole('button', { name: 'Add New Bookmark' })).toBeVisible();
});

test('isolates bookmark access, edits, and import duplicate detection between accounts', async ({
  page,
  account,
  browser,
  baseURL,
}) => {
  const bookmark = await createBookmark(page.request, {
    url: 'https://isolation.example.test',
    title: 'Private bookmark',
  });
  const other = await browser.newContext({ baseURL, extraHTTPHeaders: { 'x-forwarded-proto': 'http' } });
  try {
    await registerAccount(other.request);
    const otherPage = await other.newPage();
    await otherPage.goto('/');
    await expect(otherPage.getByRole('heading', { name: 'No bookmarks found' })).toBeVisible();
    expect(await getBookmarks(other.request)).toEqual([]);
    expect((await other.request.get(`/api/bookmarks/${bookmark.id}`)).status()).toBe(404);
    expect(
      (await other.request.patch(`/api/bookmarks/${bookmark.id}`, { data: { title: 'Overwritten' } })).status(),
    ).toBe(404);
    const preview = await other.request.post('/api/import/csv?preview=1&duplicates=merge-tags', {
      data: `url\n${bookmark.url}`,
    });
    expect(preview.ok()).toBeTruthy();
    expect(await preview.json()).toMatchObject({ imported: 1, merged: 0, duplicates: 0 });
    expect(await getBookmarks(page.request)).toMatchObject([{ id: bookmark.id, title: 'Private bookmark' }]);
  } finally {
    await other.close();
  }
});
