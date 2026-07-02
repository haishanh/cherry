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
      )
      .mockResolvedValueOnce(
        new Response(new Uint8Array([137, 80, 78, 71]), {
          status: 200,
          headers: { 'content-type': 'image/png' },
        }),
      );

    const ret = await faviconLib.favicon('https://example.com');
    expect(ret).toEqual({ type: 'image/png', url: 'https://example.com/dir/favicon.png' });
    expect(fetchMock).toHaveBeenCalledTimes(3);
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
    fetchMock.mockResolvedValueOnce(
      new Response(new Uint8Array([60, 115, 118, 103, 62]), {
        status: 200,
        headers: { 'content-type': 'image/svg+xml' },
      }),
    );

    const ret = await faviconLib.favicon('https://example.com');
    expect(ret).toEqual({ type: 'image/svg+xml', url: 'https://example.com/favicon.svg' });
  });

  test('falls back to apple-touch-icon when favicon.ico misses', async () => {
    fetchMock
      .mockResolvedValueOnce(
        new Response('<html><head></head></html>', {
          status: 200,
          headers: { 'content-type': 'text/html' },
        }),
      )
      .mockResolvedValueOnce(new Response('missing', { status: 404 }))
      .mockResolvedValueOnce(
        new Response(new Uint8Array([137, 80, 78, 71]), {
          status: 200,
          headers: { 'content-type': 'image/png' },
        }),
      );

    const ret = await faviconLib.favicon('https://example.com');
    expect(ret).toEqual({ url: 'https://example.com/apple-touch-icon.png' });
  });

  test('tries base-domain and www fallbacks before external fallback', async () => {
    fetchMock
      .mockResolvedValueOnce(
        new Response('<html><head></head></html>', {
          status: 200,
          headers: { 'content-type': 'text/html' },
        }),
      )
      .mockResolvedValueOnce(new Response('missing', { status: 404 }))
      .mockResolvedValueOnce(new Response('missing', { status: 404 }))
      .mockResolvedValueOnce(
        new Response('<html><head></head></html>', {
          status: 200,
          headers: { 'content-type': 'text/html' },
        }),
      )
      .mockResolvedValueOnce(new Response('missing', { status: 404 }))
      .mockResolvedValueOnce(new Response('missing', { status: 404 }))
      .mockResolvedValueOnce(
        new Response('<html><head><link rel="icon" href="/icon.png" type="image/png"></head></html>', {
          status: 200,
          headers: { 'content-type': 'text/html' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(new Uint8Array([137, 80, 78, 71]), {
          status: 200,
          headers: { 'content-type': 'image/png' },
        }),
      );

    const ret = await faviconLib.favicon('https://sub.example.com');
    expect(ret).toEqual({ type: 'image/png', url: 'https://www.example.com/icon.png' });
    expect(fetchMock.mock.calls.map((call) => String(call[0]))).toEqual([
      'https://sub.example.com/',
      'https://sub.example.com/favicon.ico',
      'https://sub.example.com/apple-touch-icon.png',
      'https://example.com/',
      'https://example.com/favicon.ico',
      'https://example.com/apple-touch-icon.png',
      'https://www.example.com/',
      'https://www.example.com/icon.png',
    ]);
  });
});
