import type { RequestHandler } from '@sveltejs/kit';
import * as dbUtil from '$lib/server/sqlite.util';

export const get: RequestHandler = async (event) => {
  const text = event.url.searchParams.get('q');
  const ret = dbUtil.bookmark.search({ text });
  return { status: 200, body: ret.data };
};
