import { describe, expect, test, vi } from 'vitest';

const { normalizeSiteMock, faviconMock, bufMock } = vi.hoisted(() => ({
  normalizeSiteMock: vi.fn(),
  faviconMock: vi.fn(),
  bufMock: vi.fn(),
}));

vi.mock('./favicon.util', () => ({
  normalizeSite: normalizeSiteMock,
  favicon: faviconMock,
  buf: bufMock,
  FaviconError: class FaviconError extends Error {
    constructor(public code: number) {
      super(String(code));
    }
  },
  FaviconErrorCode: {
    InvalidSite: 1,
    FaviconNotFound: 0,
  },
}));

import { GET } from './+server';

describe('favicon route caching', () => {
  test('returns 304 when If-None-Match matches the computed etag', async () => {
    normalizeSiteMock.mockReturnValue(new URL('https://example.com/'));
    faviconMock.mockResolvedValue({ type: 'image/png', url: 'https://example.com/icon.png' });
    bufMock.mockResolvedValue({ type: 'image/png', buffer: Uint8Array.from([1, 2, 3, 4]).buffer });

    const first = await GET({
      params: { site: 'example.com' },
      request: new Request('http://localhost/api/favicon/example.com'),
    } as any);

    expect(first.status).toBe(200);
    const etag = first.headers.get('etag');
    expect(etag).toBeTruthy();

    const second = await GET({
      params: { site: 'example.com' },
      request: new Request('http://localhost/api/favicon/example.com', {
        headers: { 'if-none-match': `"${etag}"` },
      }),
    } as any);

    expect(second.status).toBe(304);
    expect(second.headers.get('etag')).toBe(etag);
    expect(await second.text()).toBe('');
  });
});
