import type { RequestEvent } from '@sveltejs/kit';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { IMPORT_MAX_BYTES } from '#lib/import.js';

import { lite } from '../db/common.db';
import { ImportService } from '../services/import.service';
import { importHandler, readImportBody } from './import';

vi.mock('../db/common.db', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../db/common.db')>();
  return { ...actual, lite: vi.fn() };
});

function upload(body?: BodyInit | null, headers?: HeadersInit) {
  return new Request('http://localhost/api/import/csv', {
    method: 'POST',
    body,
    headers,
    duplex: 'half',
  } as RequestInit);
}

describe('bounded import uploads', () => {
  it('rejects an oversized declared length before reading the stream', async () => {
    const cancel = vi.fn();
    const request = upload(new ReadableStream({ cancel }), { 'content-length': String(IMPORT_MAX_BYTES + 1) });
    await expect(readImportBody(request)).rejects.toMatchObject({ status: 413 });
    expect(cancel).not.toHaveBeenCalled();
    expect(request.body?.locked).toBe(false);
  });

  it.each([undefined, '1'])(
    'enforces actual bytes even with missing or misleading content-length: %s',
    async (length) => {
      const cancel = vi.fn();
      const request = upload(
        new ReadableStream({
          start(controller) {
            controller.enqueue(new Uint8Array(4));
            controller.enqueue(new Uint8Array(4));
          },
          cancel,
        }),
        length ? { 'content-length': length } : {},
      );
      await expect(readImportBody(request, 7)).rejects.toMatchObject({ status: 413 });
      expect(cancel).not.toHaveBeenCalled();
      expect(request.body?.locked).toBe(false);
    },
  );

  it('decodes UTF-8 across chunk boundaries and accepts exactly the byte limit', async () => {
    const bytes = new TextEncoder().encode('é✓');
    const request = upload(
      new ReadableStream({
        start(controller) {
          for (const byte of bytes) controller.enqueue(new Uint8Array([byte]));
          controller.close();
        },
      }),
    );
    await expect(readImportBody(request, bytes.length)).resolves.toBe('é✓');
  });

  it('preserves upstream body-limit errors as 413', async () => {
    const request = upload(
      new ReadableStream({
        start(controller) {
          controller.error({ status: 413 });
        },
      }),
    );
    await expect(readImportBody(request)).rejects.toMatchObject({
      status: 413,
      message: expect.stringContaining('server upload limit'),
    });
  });

  it('rejects empty bodies and invalid UTF-8 with actionable errors', async () => {
    await expect(readImportBody(upload())).rejects.toMatchObject({ status: 400 });
    await expect(readImportBody(upload(''))).rejects.toMatchObject({ status: 400 });
    await expect(readImportBody(upload(new Uint8Array([0xff])))).rejects.toMatchObject({
      status: 400,
      message: expect.stringContaining('UTF-8'),
    });
  });
});

describe('import endpoint', () => {
  const run = vi.spyOn(ImportService.prototype, 'run');
  const result = {
    preview: true,
    total: 1,
    imported: 1,
    merged: 0,
    skipped: 0,
    failed: 0,
    duplicates: 0,
    issues: [],
    count: 1,
  };
  const handler = importHandler((event) => event.params.source);
  beforeEach(() => {
    vi.clearAllMocks();
    run.mockReturnValue(result);
  });
  function event(query = '', source = 'csv', authenticated = true): RequestEvent {
    return {
      request: upload('url\nhttps://example.test'),
      url: new URL(`http://localhost/api/import/${source}${query}`),
      params: { source },
      locals: authenticated ? { user: { userId: 7, feature: 0 } } : {},
    } as unknown as RequestEvent;
  }

  it('requires authentication before reading or opening the database', async () => {
    const response = await handler(event('', 'csv', false));
    expect(response.status).toBe(401);
    expect(lite).not.toHaveBeenCalled();
    expect(run).not.toHaveBeenCalled();
  });

  it.each(['?preview=true', '?duplicates=replace'])('rejects unknown options: %s', async (query) => {
    expect((await handler(event(query))).status).toBe(400);
    expect(lite).not.toHaveBeenCalled();
    expect(run).not.toHaveBeenCalled();
  });

  it('rejects unsupported sources', async () => {
    expect((await handler(event('', 'unknown'))).status).toBe(400);
    expect(lite).not.toHaveBeenCalled();
  });

  it('uses the authenticated user for previews and forwards explicit duplicate handling', async () => {
    const response = await handler(event('?preview=1&duplicates=merge-tags'));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(result);
    expect(run).toHaveBeenCalledWith({
      text: 'url\nhttps://example.test',
      source: 'csv',
      userId: 7,
      preview: true,
      duplicates: 'merge-tags',
    });
  });

  it('defaults to committed imports with duplicate skipping', async () => {
    await handler(event());
    expect(run).toHaveBeenCalledWith(expect.objectContaining({ preview: false, duplicates: 'skip' }));
  });

  it('retains the legacy Pocket endpoint', async () => {
    const legacy = importHandler(() => 'pocket');
    expect((await legacy(event())).status).toBe(200);
    expect(run).toHaveBeenCalledWith(expect.objectContaining({ source: 'pocket' }));
  });
});
