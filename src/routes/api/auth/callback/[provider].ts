import type { RequestHandler } from '@sveltejs/kit';
import { ADMIN_EMAIL_LIST, COOKIE_SECRET } from '$lib/env';

import * as cookieUtil from '$lib/utils/cookie.util';
import * as oidcUtil from '$lib/utils/oidc.util';
import * as jwtUtil from '$lib/utils/jwt.util';
import assert from 'assert';
import dbg from 'debug';

const debug = dbg('orca:api:callback');

export const get: RequestHandler = async (event) => {
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

  const email = await oidcUtil.extractEmail(json.id_token);
  if (!ADMIN_EMAIL_LIST.split(',').includes(email)) {
    return { status: 403 };
  }

  const token = await jwtUtil.sign({ email }, COOKIE_SECRET);
  const ONE_MONTH_IN_SECOND = 30 * 24 * 3600;
  const location = cookies.redirect || '/';
  return {
    status: 307,
    headers: {
      'set-cookie': `token=${token}; Path=/; Max-Age=${ONE_MONTH_IN_SECOND}; HttpOnly`,
      location,
    },
  };
};
