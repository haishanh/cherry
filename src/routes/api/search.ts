import type { RequestHandler } from '@sveltejs/kit';
import * as dbUtil from '$lib/server/sqlite.util';
import { ensureLoggedIn } from '$lib/server/guard/user.guard';

export const get: RequestHandler = async (event) => {
  const eli = ensureLoggedIn(event);
  const userId = eli.userId;
  if (!userId) return eli.handle();

  const text = event.url.searchParams.get('q');
  const ret = dbUtil.bookmark.search(userId, { text });
  return { status: 200, body: ret.data };
};
