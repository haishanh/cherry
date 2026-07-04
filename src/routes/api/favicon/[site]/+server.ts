import type { RequestHandler } from '@sveltejs/kit';
import { base64ToUint8Array, stringToUint8Array } from 'uint8array-extras';
import { fileTypeFromBuffer } from 'file-type';
import { createHash } from 'node:crypto';

import { FAVICON_CACHE_MAX_AGE_FOUND, FAVICON_CACHE_MAX_AGE_MISS } from '$lib/env';
import { ApiError, HttpStatus } from '$lib/server/api.error';
import { wrap } from '$lib/server/handlers/wrap';

import * as favicon from './favicon.util';

function matchesIfNoneMatch(header: string | null, etag: string) {
  if (!header) return false;
  return header.split(',').some((part) => {
    const token = part.trim();
    if (!token) return false;
    if (token === '*') return true;
    const normalized = token.startsWith('W/') ? token.slice(2) : token;
    return normalized === etag || normalized === `"${etag}"`;
  });
}

export const GET: RequestHandler = async (event) => {
  return wrap(event, async (event) => {
    const site = event.params.site;
    if (!site) throw new ApiError(HttpStatus.BAD_REQUEST);
    try {
      favicon.normalizeSite(site);
    } catch (e) {
      if (e instanceof favicon.FaviconError && e.code === favicon.FaviconErrorCode.InvalidSite) {
        throw new ApiError(HttpStatus.BAD_REQUEST);
      }
      throw e;
    }

    try {
      const ret = await favicon.favicon('https://' + site);

      let type: string | undefined;
      let buffer: Uint8Array<ArrayBuffer>;
      if ('data' in ret) {
        type = ret.type;
        if (ret.isB64) {
          buffer = base64ToUint8Array(ret.data);
        } else {
          buffer = stringToUint8Array(decodeURIComponent(ret.data));
        }
        if (!type) {
          const t = await fileTypeFromBuffer(buffer);
          if (t) type = t.mime;
        }
      } else {
        const tmp = await favicon.buf(ret);
        if (tmp.type) type = tmp.type;
        buffer = new Uint8Array(tmp.buffer);
      }

      const etag = createHash('md5').update(buffer).digest('hex');
      const cacheControl = `public, max-age=${FAVICON_CACHE_MAX_AGE_FOUND}, immutable`;
      if (matchesIfNoneMatch(event.request.headers.get('if-none-match'), etag)) {
        return new Response(undefined, {
          status: 304,
          headers: {
            Etag: etag,
            'Cache-Control': cacheControl,
          },
        });
      }

      return new Response(buffer, {
        headers: {
          Etag: etag,
          'Cache-Control': cacheControl,
          ...(type ? { 'Content-Type': type } : undefined),
        },
      });
    } catch (e) {
      if (!(e instanceof favicon.FaviconError && e.code === favicon.FaviconErrorCode.FaviconNotFound)) {
        console.log(site, e);
      }
      return new Response(GLOBE_SVG, {
        headers: {
          'Content-Type': `image/svg+xml`,
          'Cache-Control': `public, max-age=${FAVICON_CACHE_MAX_AGE_MISS}, immutable`,
        },
      });
    }
  });
};

const GLOBE_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#03a3ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>';
