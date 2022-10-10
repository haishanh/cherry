import type { Handle } from '@sveltejs/kit';

import { dev } from '$app/environment';
import {
  COOKIE_KEY_TOKEN,
  ENABLE_HTTP_REMOTE_USER,
  HTTP_REMOTE_USER_HEADER_NAME,
  JWT_SECRET,
  USE_INSECURE_COOKIE,
} from '$lib/env';
import { HttpStatus } from '$lib/server/api.error';
import { genPat } from '$lib/server/handlers/helper';
import { logger } from '$lib/server/logger';
import { user as userSvc } from '$lib/server/services/user.service';
import { isPublic } from '$lib/utils/access.util';
import * as cookieUtil from '$lib/utils/cookie.util';
import * as jwtUtil from '$lib/utils/jwt.util';

// import type { HandleServerError } from '@sveltejs/kit';
// export const handleError: HandleServerError = ({ error }) => {
//    if (error instanceof Error) {
//    ...
//   }

// export const handleFetch: HandleFetch = ({ event, request, fetch }) => {
//   return fetch(request);
// }

export const handle: Handle = async function handle({ event, resolve }) {
  const request = event.request;
  const url = new URL(request.url);

  if (isPublic(url)) {
    const response = await resolve(event);
    response.headers.delete('link');
    return response;
  }

  let token: string;
  const authHeader = request.headers.get('authorization');
  if (authHeader) token = authHeader.replace(/[bB]earer\s/, '');

  const sp = url.searchParams;
  if (!token && sp.get('pat')) token = sp.get('pat');

  if (!token) {
    const cookieHeader = request.headers.get('cookie');
    const cookies = cookieUtil.parseCookie(cookieHeader);
    token = cookies.token;
  }

  if (token) {
    let claims: { userId: number; feature: number };
    try {
      claims = (await jwtUtil.validate(token, JWT_SECRET)) as { userId: number; feature: number };
    } catch (e) {
      logger.info(e, 'hooks');
      const res = new Response(undefined, {
        status: HttpStatus.FORBIDDEN,
        headers: {
          // clean token cookie so user wont stuck
          'set-cookie': cookieUtil.gen(COOKIE_KEY_TOKEN, 'deleted', {
            maxAge: 0,
            insecure: USE_INSECURE_COOKIE || dev,
          }),
        },
      });
      return res;
    }
    event.locals.user = claims;
  }

  if (!event.locals.user && ENABLE_HTTP_REMOTE_USER && HTTP_REMOTE_USER_HEADER_NAME) {
    const user = await handleRemoteUser({ event });
    if (user) {
      event.locals.user = { userId: user.id, feature: user.feature };
      const { token, maxAge } = await genPat(user);
      // this will make cookie available in load of `src/routes/+page.ts`
      event.cookies.set(COOKIE_KEY_TOKEN, token, { maxAge });
    }
  }

  const response = await resolve(event);
  // prettier-ignore
  logger.info('%s %s %s %s', event.request.method, url.pathname, response.status, response.headers.get('content-type') || '');

  if (response.status === 307) {
    const ONE_DAY_IN_SECOND = 24 * 3600;
    const cookie = cookieUtil.gen('redirect', url.pathname, {
      maxAge: ONE_DAY_IN_SECOND,
      insecure: USE_INSECURE_COOKIE || dev,
    });
    response.headers.append('set-cookie', cookie);
  }

  // get rid of the big link header
  // this should not be necesary since we already got these links in HTML meta link tags
  //
  // big header causes Nginx 502
  //
  // also this https://github.com/sveltejs/kit/issues/6790#issuecomment-1254205734
  response.headers.delete('link');
  return response;
};

type RequetEvent = Parameters<Handle>[0]['event'];

const handleRemoteUser = async ({ event }: { event: RequetEvent }) => {
  const headers = event.request.headers;
  const username = headers.get(HTTP_REMOTE_USER_HEADER_NAME);
  logger.info('username=%s', username);

  // skip
  if (!username) return;

  let result = userSvc.getUserByUsername({ username });
  if (!result) {
    // create passwordless user
    result = await userSvc.createUser({ username });
  }
  if (typeof result.id === 'number' && typeof result.feature === 'number') {
    return result;
  } else {
    logger.warn('remote user header %s=%s present but read/create user failed', HTTP_REMOTE_USER_HEADER_NAME, username);
  }
};
