import type { RequestHandler } from '@sveltejs/kit';
import assert from 'assert';

import { ENABLE_REGISTRATION } from '$lib/env';
import * as dbUtil from '$lib/server/sqlite.util';

export const post: RequestHandler = async (event) => {
  if (!ENABLE_REGISTRATION) {
    return { status: 400 };
  }

  const body = await event.request.json();

  assert(body.email);

  const { error } = dbUtil.user.create({ username: body.email });
  if (!error) {
    return { status: 201 };
  }

  return { status: 500 };
};
