import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

import { ensureInt, ensureUser, requestBody, zalidate } from '$lib/server/handlers/helper';
import { wrap } from '$lib/server/handlers/wrap';
import { bookmark as bookmarkSvc } from '$lib/server/services/bookmark.service';
import { type BookmarkFromDb, type InputUpdateBookmark, SchemaUpdateBookmark } from '$lib/type';

export const GET: RequestHandler = async (event) => {
  return wrap(event, async (event) => {
    const user = ensureUser(event);
    const id = ensureInt(event.params.id);
    const data = bookmarkSvc.getBookmark({ user, id });
    return json(data);
  });
};

export const PATCH: RequestHandler = async (event) => {
  return wrap(event, async (event) => {
    const user = ensureUser(event);
    const id = ensureInt(event.params.id);
    const body = await requestBody(event);
    const input = zalidate(SchemaUpdateBookmark, { ...body, user, id });
    const bookmark: BookmarkFromDb = bookmarkSvc.updateBookmark(input as InputUpdateBookmark);
    return json(bookmark);
  });
};

export const DELETE: RequestHandler = async (event) => {
  return wrap(event, async (event) => {
    const user = ensureUser(event);
    const id = ensureInt(event.params.id);
    bookmarkSvc.deleteBookmark({ user, id });
    return json({ id });
  });
};
