import type { RequestHandler } from '@sveltejs/kit';
import assert from 'assert';

import { COOKIE_KEY_OAUTH_STATE } from '#lib/env.js';
import { signInUser } from '#lib/server/handlers/helper.js';
import { wrap } from '#lib/server/handlers/wrap.js';
import { logger } from '#lib/server/logger.js';
import { getUserService } from '#lib/server/services/registry.js';
import * as cookieUtil from '#lib/utils/cookie.util.js';
import * as oidcUtil from '#lib/utils/oidc.util.js';

export const GET: RequestHandler = async (event) => {
  return wrap(
    event,
    async (event) => {
      logger.debug('callback');
      const sp = event.url.searchParams;
      const code = sp.get('code')!;
      const stateFromProvider = sp.get('state');

      const reqHeaders = event.request.headers;
      const cookieHeader = reqHeaders.get('cookie')!;
      logger.debug('cookieHeader %s', cookieHeader);
      const cookies = cookieUtil.parseCookie(cookieHeader);
      const stateFromUs = cookies[COOKIE_KEY_OAUTH_STATE];

      logger.debug('cookieHeader %o', { stateFromProvider, stateFromUs });
      assert(stateFromProvider === stateFromUs, 'OAuth state does not match what we provided');

      // TODO should show appropriate error (instead of "forbidden") for error here
      const json = await oidcUtil.exchangeToken({ code });

      logger.debug('token res %o', json);
      assert(json.id_token);

      const username = await oidcUtil.extractEmail(json.id_token);
      const userSvc = getUserService();
      const user = userSvc.getUserByUsername({ username });
      logger.debug('user from db %o', user);
      const userId = user?.id;
      if (!userId) {
        throw new Response(undefined, { status: 307, headers: { location: '/error/forbidden' } });
      }
      const location = cookies.redirect || '/';
      return signInUser(user, location);
    },
    () => {
      return new Response(undefined, { status: 307, headers: { location: '/error/forbidden' } });
    },
  );
};
