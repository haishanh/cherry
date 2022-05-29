import type { RequestHandler } from '@sveltejs/kit';
import assert from 'assert';

import { PAGE_BOOKMARK_LIMIT } from '$lib/env';
import { ensureLoggedIn } from '$lib/server/guard/user.guard';
import * as dbUtil from '$lib/server/sqlite.util';
import type { BookmarkGetAllOpts } from '$lib/type';

export const get: RequestHandler = async (event) => {
  const eli = ensureLoggedIn(event);
  const userId = eli.userId;
  if (!userId) return eli.handle();

  const allOpts: BookmarkGetAllOpts = { userId };

  const url = event.url;
  const nextStr = url.searchParams.get('after');
  if (nextStr) {
    const [u, i] = nextStr.split('.');
    const updatedAt = parseInt(u, 10);
    const id = parseInt(i, 10);
    assert(!isNaN(updatedAt));
    assert(!isNaN(id));
    allOpts.after = { updatedAt, id };
  }

  const { data, error } = dbUtil.bookmark.all(allOpts);

  const meta: { after?: string } = {};

  if (data.length >= PAGE_BOOKMARK_LIMIT) {
    const last = data[data.length - 1];
    assert(last.updatedAt);
    meta.after = last.updatedAt + '.' + last.id;
  }

  if (data) {
    return { status: 200, body: { meta, data } };
  } else {
    console.log('ERROR', error);
    return { status: 500 };
  }
};

export const post: RequestHandler = async (event) => {
  const eli = ensureLoggedIn(event);
  const userId = eli.userId;
  if (!userId) return eli.handle();

  const body = await event.request.json();

  assert(body.url);
  const { data, error } = dbUtil.bookmark.create(userId, body);
  if (data) {
    return { status: 201, body: data };
  } else {
    console.log('ERROR', error);
    return { status: 500 };
  }
};
