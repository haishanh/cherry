import type { RequestHandler } from '@sveltejs/kit';

import { ensureLoggedIn } from '$lib/server/guard/user.guard';
import * as dbUtil from '$lib/server/sqlite.util';

export const get: RequestHandler = async (event) => {
  const eli = ensureLoggedIn(event);
  const userId = eli.userId;
  if (!userId) return eli.handle();

  const text = event.url.searchParams.get('q');
  const { data, error } = dbUtil.bookmark.search(userId, { text });
  if (data) {
    return {
      status: 201,
      body: {
        meta: {},
        data,
      },
    };
  } else {
    console.log('ERROR', error);
    return { status: 500 };
  }
};
