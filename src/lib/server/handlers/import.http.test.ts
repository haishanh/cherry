import { createServer, request as httpRequest, Agent, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';

import { getRequest, setResponse } from '@sveltejs/kit/node';
import type { RequestEvent } from '@sveltejs/kit';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { IMPORT_MAX_BYTES } from '#lib/import.js';

import { importHandler } from './import';

describe('import errors over real HTTP with the SvelteKit Node adapter', () => {
  let server: Server;
  let port: number;
  const agent = new Agent({ keepAlive: true, maxSockets: 1 });
  const handler = importHandler(() => 'csv');

  beforeAll(async () => {
    server = createServer(async (req, res) => {
      if (req.url === '/health') {
        setResponse(res, new Response('ok'));
        return;
      }
      const base = `http://127.0.0.1:${port}`;
      const request = getRequest({ request: req, response: res, base });
      const event = {
        request,
        url: new URL(request.url),
        locals: { user: { userId: 1, feature: 0 } },
      } as RequestEvent;
      setResponse(res, await handler(event));
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    port = (server.address() as AddressInfo).port;
  });

  afterAll(async () => {
    agent.destroy();
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  });

  function send(body?: Buffer, chunked = false) {
    return new Promise<{ status: number; body: string; localPort: number | undefined }>((resolve, reject) => {
      const req = httpRequest({
        hostname: '127.0.0.1',
        port,
        path: body ? '/api/import/csv?preview=1' : '/health',
        method: body ? 'POST' : 'GET',
        headers: body && !chunked ? { 'content-length': String(body.byteLength) } : {},
        agent,
      });
      req.on('error', reject);
      req.on('response', (res) => {
        const localPort = res.socket.localPort;
        const chunks: Buffer[] = [];
        res.on('data', (chunk: Buffer) => chunks.push(chunk));
        res.on('error', reject);
        res.on('end', () => resolve({ status: res.statusCode!, body: Buffer.concat(chunks).toString(), localPort }));
      });
      if (body && chunked) {
        req.write(body.subarray(0, 4096));
        req.end(body.subarray(4096));
      } else {
        req.end(body);
      }
    });
  }

  it.each([false, true])('returns JSON 413 without resetting the connection (chunked=%s)', async (chunked) => {
    const response = await send(Buffer.alloc(IMPORT_MAX_BYTES + 1, 120), chunked);
    expect(response.status).toBe(413);
    expect(JSON.parse(response.body)).toMatchObject({ message: expect.stringContaining('10 MiB') });
    const next = await send();
    expect(next).toMatchObject({ status: 200, body: 'ok', localPort: response.localPort });
  });

  it.each([false, true])(
    'returns JSON 400 for invalid UTF-8 without resetting the connection (chunked=%s)',
    async (chunked) => {
      // The valid tail ensures an error early in the stream also leaves unread bytes.
      const response = await send(Buffer.concat([Buffer.from([0xff]), Buffer.alloc(64 * 1024, 120)]), chunked);
      expect(response.status).toBe(400);
      expect(JSON.parse(response.body)).toMatchObject({ message: expect.stringContaining('UTF-8') });
      const next = await send();
      expect(next).toMatchObject({ status: 200, body: 'ok', localPort: response.localPort });
    },
  );
});
