import * as crc32Util from '@node-rs/crc32';
import type { RequestHandler } from '@sveltejs/kit';
import { fileTypeFromBuffer} from 'file-type'

import { FAVICON_CACHE_MAX_AGE_FOUND, FAVICON_CACHE_MAX_AGE_MISS } from '$lib/env';
import { ApiError, HttpStatus } from '$lib/server/api.error';
import { wrap } from '$lib/server/handlers/wrap';

import * as favicon from './favicon.util';

export const GET: RequestHandler = async (event) => {
  return wrap(event, async (event) => {
    const site = event.params.site;
    if (!site) throw new ApiError(HttpStatus.BAD_REQUEST);

    try {
      let ret: { type?: string; url: string } | { type: string; isB64: boolean; data: string };
      try {
        ret = await favicon.favicon('https://' + site);
      } catch (e) {
        if ((e as Error).name === 'AbortError') {
          ret = { url: `https://icons.duckduckgo.com/ip3/${site}.ico` };
        } else {
          throw e;
        }
      }

      let type: string | undefined;
      let buffer: Buffer;
      if ('data' in ret) {
        type = ret.type;
        if (ret.isB64) {
          buffer = Buffer.from(ret.data, 'base64');
        } else {
          buffer = Buffer.from(decodeURIComponent(ret.data));
        }
        if (!type) {
          const t = await fileTypeFromBuffer(buffer);
          if (t) type = t.mime;
        }
      } else {
        const tmp = await favicon.buf(ret, site);
        if (tmp.type) type = tmp.type;
        buffer = tmp.buffer;
      }

      const etag = crc32Util.crc32c(buffer);

      return new Response(buffer, {
        headers: {
          Etag: '' + etag,
          'Cache-Control': `public, max-age=${FAVICON_CACHE_MAX_AGE_FOUND}, immutable`,
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
