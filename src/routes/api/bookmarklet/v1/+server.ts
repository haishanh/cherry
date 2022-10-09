import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

import { ApiError, HttpStatus } from '$lib/server/api.error';
import { ensureUser, zalidate } from '$lib/server/handlers/helper';
import { wrap } from '$lib/server/handlers/wrap';
import { bookmark as bookmarkSvc } from '$lib/server/services/bookmark.service';
import { type InputCreateBookmark, type User, SchemaCreateBookmark } from '$lib/type';
import { fetchMeta } from '$lib/utils/html.util';

export const GET: RequestHandler = async (event) => {
  return wrap(event, async (event) => {
    const user = ensureUser(event);
    const sp = event.url.searchParams;
    const url = sp.get('url');
    if (!url) throw new ApiError(HttpStatus.BAD_REQUEST);
    const toValidate: {
      url: string;
      user: User;
      desc?: string;
      title?: string;
    } = { url, user };
    try {
      const { title, desc } = await fetchMeta(url);
      if (title) toValidate.title = title;
      if (desc) toValidate.desc = desc;
    } catch (e) {
      // ignore
    }
    const input = zalidate(SchemaCreateBookmark, toValidate);
    const data = bookmarkSvc.createBookmark(input as InputCreateBookmark);
    return json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  });
};
