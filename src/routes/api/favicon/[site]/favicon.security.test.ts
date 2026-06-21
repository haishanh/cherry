import { beforeEach, describe, expect, test, vi } from 'vitest';

const { fetchMock, lookupMock } = vi.hoisted(() => ({
  fetchMock: vi.fn(),
  lookupMock: vi.fn(),
}));

vi.mock('undici', async () => {
  const actual = await vi.importActual<typeof import('undici')>('undici');
  return {
    ...actual,
    fetch: fetchMock,
    ProxyAgent: class {},
  };
});

vi.mock('node:dns/promises', () => ({
  lookup: lookupMock,
}));

import * as faviconLib from './favicon.util';

describe('favicon hardening', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    lookupMock.mockReset();
    lookupMock.mockResolvedValue([{ address: '93.184.216.34', family: 4 }]);
  });

  test('normalizeSite accepts host with port', () => {
    const url = faviconLib.normalizeSite('example.com:8443');
    expect(url.toString()).toBe('https://example.com:8443/');
  });

  test('normalizeSite rejects paths and credentials', () => {
    expect(() => faviconLib.normalizeSite('example.com/path')).toThrow();
    expect(() => faviconLib.normalizeSite('user@example.com')).toThrow();
  });

  test('isBlockedAddress detects private and loopback ranges', () => {
    expect(faviconLib.isBlockedAddress('127.0.0.1')).toBe(true);
    expect(faviconLib.isBlockedAddress('10.0.0.1')).toBe(true);
    expect(faviconLib.isBlockedAddress('8.8.8.8')).toBe(false);
    expect(faviconLib.isBlockedAddress('::1')).toBe(true);
  });

  test('assertPublicUrl rejects localhost names', async () => {
    await expect(faviconLib.assertPublicUrl('https://localhost:3000')).rejects.toMatchObject({
      code: faviconLib.FaviconErrorCode.InvalidSite,
    });
  });

  test('follows redirects with correct relative URL resolution', async () => {
    fetchMock
      .mockResolvedValueOnce(new Response('', { status: 302, headers: { location: '/dir/page' } }))
      .mockResolvedValueOnce(
        new Response('<html><head><link rel="icon" href="./favicon.png" type="image/png"></head></html>', {
          status: 200,
          headers: { 'content-type': 'text/html' },
        }),
      );

    const ret = await faviconLib.favicon('https://example.com');
    expect(ret).toEqual({ type: 'image/png', url: 'https://example.com/dir/favicon.png' });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  test('caps redirect chains', async () => {
    for (let i = 0; i < 6; i++) {
      fetchMock.mockResolvedValueOnce(new Response('', { status: 302, headers: { location: '/next' } }));
    }

    await expect(faviconLib.favicon('https://example.com')).rejects.toMatchObject({
      code: faviconLib.FaviconErrorCode.TooManyRedirects,
    });
  });

  test('rejects oversized icon responses', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(new Uint8Array([1, 2, 3]), {
        status: 200,
        headers: { 'content-length': String(300 * 1024), 'content-type': 'image/png' },
      }),
    );

    await expect(faviconLib.buf({ url: 'https://example.com/favicon.png' })).rejects.toMatchObject({
      code: faviconLib.FaviconErrorCode.ResponseTooLarge,
    });
  });

  test('parses favicon from head without buffering a huge body', async () => {
    const body = new ReadableStream({
      start(controller) {
        controller.enqueue(
          new TextEncoder().encode(
            '<html><head><link rel="icon" href="/favicon.svg" type="image/svg+xml"></head><body>',
          ),
        );
        controller.enqueue(new Uint8Array(200 * 1024));
        controller.close();
      },
    });

    fetchMock.mockResolvedValueOnce(
      new Response(body, {
        status: 200,
        headers: { 'content-type': 'text/html' },
      }),
    );

    const ret = await faviconLib.favicon('https://example.com');
    expect(ret).toEqual({ type: 'image/svg+xml', url: 'https://example.com/favicon.svg' });
  });
});
