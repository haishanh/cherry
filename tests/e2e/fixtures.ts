import { randomUUID } from 'node:crypto';

import { test as base, expect, type APIRequestContext, type Page } from '@playwright/test';

export type Account = { username: string; password: string };
export type Bookmark = {
  id: number;
  url: string;
  title: string;
  desc: string;
  tagIds: number[];
  groupId: number | null;
  createdAt: number;
  updatedAt: number;
};

export function newAccount(): Account {
  return { username: `e2e-${randomUUID()}@example.test`, password: 'E2E-only-password-123!' };
}

export async function registerAccount(request: APIRequestContext): Promise<Account> {
  const account = newAccount();
  const response = await request.post('/api/auth/signup', { data: account });
  expect(response.status()).toBe(204);
  return account;
}

export async function getBookmarks(request: APIRequestContext): Promise<Bookmark[]> {
  const response = await request.get('/api/bookmarks');
  expect(response.ok()).toBeTruthy();
  return (await response.json()).data.items;
}

export async function createBookmark(
  request: APIRequestContext,
  input: { url: string; title: string; desc?: string; tags?: { name: string }[] },
): Promise<Bookmark> {
  const response = await request.post('/api/bookmarks', { data: input });
  expect(response.ok()).toBeTruthy();
  return response.json();
}

export async function openCsvImport(page: Page) {
  await page.goto('/settings/import');
  await page.getByRole('tab', { name: 'CSV', exact: true }).click();
  return page.getByRole('tabpanel', { name: 'CSV', exact: true });
}

export const test = base.extend<{ account: Account }>({
  page: async ({ page, baseURL }, use) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    const origin = new URL(baseURL!).origin;
    // Tests exercise the real backend, but never depend on third-party favicons,
    // fonts, analytics, or imported bookmark destinations being online.
    await page.route('**/*', (route) => {
      const url = new URL(route.request().url());
      if (url.origin !== origin) return route.abort();
      if (url.pathname.startsWith('/api/favicon/')) return route.fulfill({ status: 404, body: '' });
      return route.continue();
    });
    await use(page);
    expect(errors, 'Unexpected browser exceptions').toEqual([]);
  },
  account: async ({ page }, use) => {
    await use(await registerAccount(page.request));
  },
});

export { expect };
