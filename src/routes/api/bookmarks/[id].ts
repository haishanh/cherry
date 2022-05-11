import type { RequestHandler } from '@sveltejs/kit';
import assert from 'assert';

import { ApiError } from '$lib/server/api.error';
import { ensureLoggedIn } from '$lib/server/guard/user.guard';
import * as dbUtil from '$lib/server/sqlite.util';

export const del: RequestHandler = async (event) => {
  const eli = ensureLoggedIn(event);
  const userId = eli.userId;
  if (!userId) return eli.handle();

  const id = event.params.id;
  assert(id);

  const ret = dbUtil.bookmark.delete({ userId, id });
  if (ret.data) {
    return { status: 200, body: ret.data };
  } else {
    const error = ret.error;
    console.log('ERROR', error);
    if (error instanceof ApiError) {
      return { status: error.status, body: { code: error.code } };
    } else {
      return { status: 500 };
    }
  }
};
