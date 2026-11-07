import { fileURLToPath } from 'node:url';

import { test, expect, createBookmark, getBookmarks, openCsvImport } from './fixtures';

const csvFile = fileURLToPath(new URL('./data/bookmarks.csv', import.meta.url));
const maxBytes = 10 * 1024 * 1024;

test('previews without writing, commits valid CSV rows, and skips repeated imports', async ({ page, account }) => {
  const panel = await openCsvImport(page);
  await panel.locator('input[type=file]').setInputFiles(csvFile);
  await panel.getByRole('button', { name: 'Preview import', exact: true }).click();
  await expect(
    panel.getByText('4 total: 2 to import, 0 to merge, 1 skipped, 1 invalid.', { exact: true }),
  ).toBeVisible();
  await expect(panel.getByText(/Invalid URL\. Use an absolute/)).toBeVisible();
  expect(await getBookmarks(page.request)).toEqual([]);
  expect((await page.request.get('/api/tags')).ok()).toBeTruthy();
  expect((await (await page.request.get('/api/tags')).json()).data).toEqual([]);
  expect((await (await page.request.get('/api/groups')).json()).data).toEqual([]);

  await panel.getByRole('button', { name: 'Confirm import', exact: true }).click();
  await expect(panel.getByRole('heading', { name: 'Import complete' })).toBeVisible();
  const bookmarks = await getBookmarks(page.request);
  expect(bookmarks).toHaveLength(2);
  expect(bookmarks.find((bookmark) => bookmark.url.endsWith('/first'))).toMatchObject({
    title: 'A "quoted", title',
    desc: 'A multiline\ndescription',
    createdAt: 1704067200,
  });
  expect(bookmarks.find((bookmark) => bookmark.url.endsWith('/second'))).toMatchObject({ title: '第二书签', desc: '' });
  expect(
    (await (await page.request.get('/api/groups')).json()).data.map((group: { name: string }) => group.name),
  ).toEqual(['Reading']);

  await panel.getByRole('button', { name: 'Preview import', exact: true }).click();
  await expect(
    panel.getByText('4 total: 0 to import, 0 to merge, 3 skipped, 1 invalid.', { exact: true }),
  ).toBeVisible();
  await expect(panel.getByRole('button', { name: 'Confirm import', exact: true })).toBeDisabled();
  expect(await getBookmarks(page.request)).toEqual(bookmarks);
});

test('merges tags without changing existing bookmark metadata', async ({ page, account }) => {
  const original = await createBookmark(page.request, {
    url: 'https://import-e2e.example.test/first',
    title: 'Keep this title',
    desc: 'Keep this description',
    tags: [{ name: 'original' }],
  });
  const panel = await openCsvImport(page);
  const mode = panel.getByRole('combobox', { name: 'Existing bookmarks', exact: true });
  await mode.click();
  await panel.getByRole('option', { name: 'Merge tags only', exact: true }).click();
  await panel.locator('input[type=file]').setInputFiles(csvFile);
  await panel.getByRole('button', { name: 'Preview import', exact: true }).click();
  await expect(
    panel.getByText('4 total: 1 to import, 1 to merge, 1 skipped, 1 invalid.', { exact: true }),
  ).toBeVisible();
  await panel.getByRole('button', { name: 'Confirm import', exact: true }).click();
  await expect(panel.getByRole('heading', { name: 'Import complete' })).toBeVisible();
  const current = (await getBookmarks(page.request)).find((bookmark) => bookmark.id === original.id)!;
  expect(current).toMatchObject({
    id: original.id,
    url: original.url,
    title: original.title,
    desc: original.desc,
    groupId: original.groupId,
    createdAt: original.createdAt,
    updatedAt: original.updatedAt,
  });
  const tags = (await (await page.request.get('/api/tags')).json()).data as { id: number; name: string }[];
  expect(current.tagIds.map((id) => tags.find((tag) => tag.id === id)!.name).sort()).toEqual([
    'original',
    'rust',
    'tools',
  ]);
});

test('supports keyboard selection, Escape, outside dismissal, and clears stale previews on mode changes', async ({
  page,
  account,
}) => {
  const panel = await openCsvImport(page);
  const mode = panel.getByRole('combobox', { name: 'Existing bookmarks', exact: true });
  await mode.focus();
  await mode.press('ArrowDown');
  await expect(mode).toHaveAttribute('aria-expanded', 'true');
  await mode.press('End');
  await mode.press('Enter');
  await expect(mode).toHaveText('Merge tags only');
  await expect(mode).toBeFocused();
  await mode.press('ArrowDown');
  await mode.press('Home');
  await mode.press('Escape');
  await expect(mode).toHaveText('Merge tags only');
  await expect(mode).toHaveAttribute('aria-expanded', 'false');
  await mode.click();
  await page.getByRole('tab', { name: 'CSV', exact: true }).click();
  await expect(mode).toHaveAttribute('aria-expanded', 'false');

  await panel.locator('input[type=file]').setInputFiles(csvFile);
  await panel.getByRole('button', { name: 'Preview import', exact: true }).click();
  await expect(panel.getByRole('heading', { name: /nothing saved yet/ })).toBeVisible();
  await mode.focus();
  await mode.press('ArrowDown');
  await mode.press('Home');
  await mode.press('Enter');
  await expect(mode).toHaveText('Skip duplicates');
  await expect(panel.getByRole('heading', { name: /nothing saved yet/ })).toHaveCount(0);
  await expect(panel.getByRole('button', { name: 'Confirm import', exact: true })).toHaveCount(0);
});

test('disables controls while a preview is in flight', async ({ page, account }) => {
  const panel = await openCsvImport(page);
  await panel.locator('input[type=file]').setInputFiles(csvFile);
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/api/import/csv?*', async (route) => {
    await gate;
    await route.fallback();
  });
  try {
    await panel.getByRole('button', { name: 'Preview import', exact: true }).click();
    await expect(panel.getByRole('combobox', { name: 'Existing bookmarks', exact: true })).toBeDisabled();
    await expect(panel.getByRole('button', { name: 'Preview import', exact: true })).toBeDisabled();
  } finally {
    release();
  }
  await expect(panel.getByRole('heading', { name: /nothing saved yet/ })).toBeVisible();
  await expect(panel.getByRole('combobox', { name: 'Existing bookmarks', exact: true })).toBeEnabled();
});

for (const { name, content, error } of [
  { name: 'missing URL header', content: 'title\nMissing URL', error: 'missing column url' },
  {
    name: 'unclosed quotes',
    content: 'url,title\nhttps://valid.example.test,Valid\nhttps://broken.example.test,"unclosed',
    error: 'Unclosed quoted field',
  },
  { name: 'empty files', content: '', error: 'Select a non-empty export file' },
  { name: 'record limit', content: 'url\n' + 'invalid\n'.repeat(10_001), error: 'Too many bookmarks' },
]) {
  test(`reports ${name} without saving bookmarks`, async ({ page, account }) => {
    const panel = await openCsvImport(page);
    await panel
      .locator('input[type=file]')
      .setInputFiles({ name: 'invalid.csv', mimeType: 'text/csv', buffer: Buffer.from(content) });
    await panel.getByRole('button', { name: 'Preview import', exact: true }).click();
    await expect(panel.getByRole('alert')).toContainText(error);
    await expect(panel.getByRole('button', { name: 'Confirm import', exact: true })).toHaveCount(0);
    expect(await getBookmarks(page.request)).toEqual([]);
  });
}

test('blocks oversized file selection before uploading', async ({ page, account }) => {
  const panel = await openCsvImport(page);
  const imports: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('/api/import')) imports.push(request.url());
  });
  await panel
    .locator('input[type=file]')
    .setInputFiles({ name: 'oversized.csv', mimeType: 'text/csv', buffer: Buffer.alloc(maxBytes + 1, 120) });
  await expect(panel.getByText(/File is larger than/)).toBeVisible();
  await expect(panel.getByRole('button', { name: 'Preview import', exact: true })).toBeDisabled();
  expect(imports).toEqual([]);
});

test('returns readable HTTP errors to browser fetch rather than resetting connections', async ({ page, account }) => {
  await page.goto('/settings/import');
  const results = await page.evaluate(async (limit) => {
    const inputs = [new Blob(['x'.repeat(limit + 1)], { type: 'text/csv' }), new Uint8Array([255])];
    const results = [];
    for (const body of inputs) {
      const response = await fetch('/api/import/csv?preview=1', { method: 'POST', body });
      results.push({ status: response.status, body: await response.json() });
    }
    return results;
  }, maxBytes);
  expect(results).toEqual([
    { status: 413, body: { message: expect.stringContaining('10 MiB') } },
    { status: 400, body: { message: expect.stringContaining('UTF-8') } },
  ]);
  expect(await getBookmarks(page.request)).toEqual([]);
});

for (const source of ['Chrome', 'Pocket'] as const) {
  test(`imports ${source} HTML with entities, tags, and original dates`, async ({ page, account }) => {
    const link =
      '<A HREF="https://html.example.test/bookmark?a=1&amp;b=2" ADD_DATE="1629980125" time_added="1629980125" TAGS="html">A &amp; <b>bold</b> title</A>';
    const html =
      source === 'Chrome'
        ? `<!DOCTYPE NETSCAPE-Bookmark-file-1><DL><DT><H3>Folder &amp; Co</H3><DL><DT>${link}</DL></DL>`
        : `<html><body><ul><li>${link}</li></ul></body></html>`;
    await page.goto('/settings/import');
    await page.getByRole('tab', { name: source, exact: true }).click();
    const panel = page.getByRole('tabpanel', { name: source, exact: true });
    await panel
      .locator('input[type=file]')
      .setInputFiles({ name: 'bookmarks.html', mimeType: 'text/html', buffer: Buffer.from(html) });
    await panel.getByRole('button', { name: 'Preview import', exact: true }).click();
    await expect(
      panel.getByText('1 total: 1 to import, 0 to merge, 0 skipped, 0 invalid.', { exact: true }),
    ).toBeVisible();
    await panel.getByRole('button', { name: 'Confirm import', exact: true }).click();
    await expect(panel.getByRole('heading', { name: 'Import complete' })).toBeVisible();
    expect(await getBookmarks(page.request)).toMatchObject([
      { title: 'A & bold title', url: 'https://html.example.test/bookmark?a=1&b=2', createdAt: 1629980125 },
    ]);
  });
}
