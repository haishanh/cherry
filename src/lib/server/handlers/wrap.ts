import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

import { ApiError } from '../api.error';
import { logger } from '../logger';

type Event = Parameters<RequestHandler>[0];

export async function wrap(event: Event, fn: (e: Event) => any, fallbackHandler?: (e: Error) => Response) {
  try {
    const t = fn(event);
    let r = t;
    if (t.then && typeof t.then === 'function') r = await t;
    if (r instanceof Response) return r;
    if (r && typeof r === 'object') return json(r);
    // With blow line we'll need to deliberately return a Response for status-204 case
    throw new Error('wrap fn not called properly');
  } catch (x) {
    if (x instanceof Response) return x;
    if (x instanceof ApiError) return json(x.toJSON(), { status: x.status });
    // TODO more context
    logger.error({ error: x }, 'unhandled error');
    if (fallbackHandler) {
      try {
        return fallbackHandler(x);
      } catch (e) {
        // ignore
      }
    }
    return new Response(undefined, { status: 500 });
  }
}
