import type { RequestHandler } from '@sveltejs/kit';
import * as dbUtil from '$lib/server/sqlite.util';
import assert from 'assert';

export const get: RequestHandler = async () => {
  const ret = dbUtil.bookmark.all();
  return { status: 200, body: ret.data };
};

export const post: RequestHandler = async (event) => {
  const body = await event.request.json();
  assert(body.url);
  const ret = dbUtil.bookmark.create(body);
  if (ret.data) {
    return { status: 201, body: ret.data };
  } else {
    console.log('ERROR', ret.error);
    return { status: 500 };
  }
};
