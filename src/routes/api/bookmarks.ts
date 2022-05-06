import type { RequestHandler } from '@sveltejs/kit';
import * as dbUtil from '$lib/server/sqlite.util';
import assert from 'assert';
import {ensureLoggedIn} from '$lib/server/guard/user.guard'

export const get: RequestHandler = async (event) => {
  const eli = ensureLoggedIn(event);
  const userId = eli.userId;
  if (!userId) return eli.handle();

  const ret = dbUtil.bookmark.all({ userId });
  return { status: 200, body: ret.data };
};

export const post: RequestHandler = async (event) => {
  const eli = ensureLoggedIn(event);
  const userId = eli.userId;
  if (!userId) return eli.handle();

  const body = await event.request.json();

  assert(body.url);
  const ret = dbUtil.bookmark.create(userId, body);
  if (ret.data) {
    return { status: 201, body: ret.data };
  } else {
    console.log('ERROR', ret.error);
    return { status: 500 };
  }
};
