import type { RequestHandler } from '@sveltejs/kit';
import assert from 'assert';

import { dev } from '$app/environment';
import { COOKIE_KEY_OAUTH_STATE } from '$lib/env';
import { logger } from '$lib/server/logger';
import * as cookieUtil from '$lib/utils/cookie.util';
import * as oidcUtil from '$lib/utils/oidc.util';

const ONE_DAY_IN_SECOND = 24 * 3600;
export const GET: RequestHandler = async ({ params }) => {
  const provider = params.provider;
  assert(provider === 'google');

  const { authUrl, state } = oidcUtil.authCodeUrl();

  logger.debug('/api/auth/google state=%s', state);

  const headers = new Headers();
  headers.append(
    'set-cookie',
    cookieUtil.gen(COOKIE_KEY_OAUTH_STATE, state, { maxAge: ONE_DAY_IN_SECOND, secure: !dev })
  );
  headers.append('location', authUrl);

  return new Response(undefined, { status: 307, headers });
};
