import type { RequestHandler } from '@sveltejs/kit';
import { COOKIE_SECRET } from '$lib/env';

import * as cookieUtil from '$lib/utils/cookie.util';
import * as oidcUtil from '$lib/utils/oidc.util';
import * as jwtUtil from '$lib/utils/jwt.util';
import * as dbUtil from '$lib/server/sqlite.util';
import assert from 'assert';
import dbg from 'debug';

const debug = dbg('cherry:auth:callback');

export const get: RequestHandler = async (event) => {
  debug('callback');
  const sp = event.url.searchParams;
  const code = sp.get('code');
  const stateFromProvider = sp.get('state');

  const headers = event.request.headers;
  const cookieHeader = headers.get('cookie');
  const cookies = cookieUtil.parseCookie(cookieHeader);
  const stateFromUs = cookies.oauthstate;

  assert(stateFromProvider === stateFromUs);

  const json = await oidcUtil.exchangeToken({ code });

  debug('token res %o', json);
  assert(json.id_token);

  const username = await oidcUtil.extractEmail(json.id_token);

  const retGetUser = dbUtil.user.get({ username });
  const userId = retGetUser.data?.id;
  if (!userId) {
    return { status: 403 };
  }

  const token = await jwtUtil.sign({ userId }, COOKIE_SECRET);
  const ONE_MONTH_IN_SECOND = 30 * 24 * 3600;
  const location = cookies.redirect || '/';
  return {
    status: 307,
    headers: {
      'set-cookie': `token=${token}; Path=/; SameSite=Lax; Max-Age=${ONE_MONTH_IN_SECOND}; HttpOnly`,
      location,
    },
  };
};
