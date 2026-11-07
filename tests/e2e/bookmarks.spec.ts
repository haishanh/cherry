import { test, expect, createBookmark, getBookmarks } from './fixtures';

test('creates, edits, clears optional fields, deletes, and restores a bookmark', async ({ page, account }) => {
  const url = 'https://bookmarks.example.test/entry';
  await page.goto('/');
  await page.getByRole('button', { name: 'Add New Bookmark' }).click();
  const modal = page.locator('[data-cherry-modal-overlay]');
  await modal.getByLabel('Link', { exact: true }).fill(url);
  await modal.getByLabel('Title', { exact: true }).fill('Original title');
  await modal.getByLabel('Description', { exact: true }).fill('Original description');
  await modal.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(modal).toHaveCount(0);
  await expect(page.getByRole('link', { name: /Original title/ })).toBeVisible();
  const [created] = await getBookmarks(page.request);
  expect(created).toMatchObject({ url, title: 'Original title', desc: 'Original description' });

  // The dedicated edit page uses the same form as the modal and is usable on
  // touch devices without relying on the bookmark's hover-only action menu.
  await page.goto(`/edit/${created.id}`);
  await page.getByLabel('Title', { exact: true }).fill('');
  await page.getByLabel('Description', { exact: true }).fill('');
  const saved = page.waitForResponse(
    (response) => response.url().endsWith(`/api/bookmarks/${created.id}`) && response.request().method() === 'PATCH',
  );
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  expect((await saved).ok()).toBeTruthy();
  await page.reload();
  await expect(page.getByLabel('Title', { exact: true })).toHaveValue('');
  await expect(page.getByLabel('Description', { exact: true })).toHaveValue('');
  expect(await getBookmarks(page.request)).toMatchObject([{ id: created.id, title: '', desc: '', url }]);

  await page.getByLabel('Title', { exact: true }).fill('Updated title');
  const updated = page.waitForResponse(
    (response) => response.url().endsWith(`/api/bookmarks/${created.id}`) && response.request().method() === 'PATCH',
  );
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  expect((await updated).ok()).toBeTruthy();
  await page.goto('/');
  await page.getByRole('button', { name: 'Bulk Edit', exact: true }).click();
  await page.getByRole('link', { name: /Updated title/ }).click();
  await expect(page.getByText('1 selected', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: /^Delete/ }).click();
  await expect(page.getByRole('link', { name: /Updated title/ })).toHaveCount(0);
  await expect.poll(() => getBookmarks(page.request)).toEqual([]);
  await page.getByRole('button', { name: 'UNDO', exact: true }).click();
  await expect(page.getByRole('link', { name: /Updated title/ })).toBeVisible();
  expect(await getBookmarks(page.request)).toMatchObject([{ id: created.id, title: 'Updated title', url }]);
});

test('searches URLs and punctuation literally while preserving words and quoted phrases', async ({ page, account }) => {
  await createBookmark(page.request, {
    url: 'https://import-qa.example.test/query?a=1&b=2',
    title: 'A quoted 标题',
    desc: 'alpha beta fast tool',
  });
  await createBookmark(page.request, {
    url: 'https://other.example.test',
    title: 'Another entry',
    desc: 'beta before alpha',
  });
  // Search initializes its tags and URL state asynchronously on mount. Wait for
  // that bootstrap before typing, rather than relying on a timing-based sleep.
  const tags = page.waitForResponse((response) => new URL(response.url()).pathname === '/api/tags');
  await page.goto('/');
  await (await tags).finished();
  const search = page.getByRole('textbox', { name: 'Search', exact: true });
  await search.fill('import-qa.example.test');
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await expect(page.getByRole('link', { name: /A quoted 标题/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /Another entry/ })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Could not load' })).toHaveCount(0);

  await search.fill('alpha beta');
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await expect(page.getByRole('link', { name: /Another entry/ })).toBeVisible();
  await search.fill('"alpha beta"');
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await expect(page.getByRole('link', { name: /Another entry/ })).toHaveCount(0);
  await expect(page.getByRole('link', { name: /A quoted 标题/ })).toBeVisible();

  for (const query of ['(', '"', '*', 'https://import-qa.example.test/query?a=1&b=2']) {
    const response = await page.goto(`/?q=${encodeURIComponent(query)}`);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { name: 'Could not load' })).toHaveCount(0);
  }
});
