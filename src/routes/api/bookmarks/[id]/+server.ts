import type { RequestHandler } from '@sveltejs/kit';

import { ensureInt, ensureUser, requestBody, zalidate } from '#lib/server/handlers/helper.js';
import { wrap } from '#lib/server/handlers/wrap.js';
import { bookmark as bookmarkSvc } from '#lib/server/services/bookmark.service.js';
import { type BookmarkFromDb, type InputUpdateBookmark, SchemaUpdateBookmark } from '#lib/type.js';

export const GET: RequestHandler = async (event) => {
  return wrap(event, async (event) => {
    const user = ensureUser(event);
    const id = ensureInt(event.params.id);
    const data = bookmarkSvc.getBookmark({ user, id });
    return Response.json(data);
  });
};

export const PATCH: RequestHandler = async (event) => {
  return wrap(event, async (event) => {
    const user = ensureUser(event);
    const id = ensureInt(event.params.id);
    const body = await requestBody(event);
    const input = zalidate(SchemaUpdateBookmark, { ...body, user, id });
    const bookmark: BookmarkFromDb = bookmarkSvc.updateBookmark(input as InputUpdateBookmark);
    return Response.json(bookmark);
  });
};

export const DELETE: RequestHandler = async (event) => {
  return wrap(event, async (event) => {
    const user = ensureUser(event);
    const id = ensureInt(event.params.id);
    bookmarkSvc.deleteBookmark({ user, id });
    return Response.json({ id });
  });
};
