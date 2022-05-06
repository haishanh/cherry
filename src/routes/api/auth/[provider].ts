import type { RequestHandler } from '@sveltejs/kit';
import assert from 'assert';
import * as oidcUtil from '$lib/utils/oidc.util';

export const get: RequestHandler = async ({ params }) => {
  const provider = params.provider;
  assert(provider === 'google');

  const { authUrl, state } = oidcUtil.authCodeUrl();
  const ONE_DAY_IN_SECOND = 24 * 3600;

  return {
    status: 307,
    headers: {
      'set-cookie': `oauthstate=${state}; Path=/; Max-Age=${ONE_DAY_IN_SECOND}; HttpOnly`,
      location: authUrl,
    },
  };
};
