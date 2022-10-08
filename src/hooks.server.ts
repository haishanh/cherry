import type { Handle } from '@sveltejs/kit';

import { dev } from '$app/environment';
import { COOKIE_KEY_TOKEN, JWT_SECRET, USE_INSECURE_COOKIE } from '$lib/env';
import { HttpStatus } from '$lib/server/api.error';
import { logger } from '$lib/server/logger';
import { isPublic } from '$lib/utils/access.util';
import * as cookieUtil from '$lib/utils/cookie.util';
import * as jwtUtil from '$lib/utils/jwt.util';

// import type { HandleServerError } from '@sveltejs/kit';
// export const handleError: HandleServerError = ({ error }) => {
//    if (error instanceof Error) {
//    ...
//   }

export const handle: Handle = async function handle({ event, resolve }) {
  const request = event.request;
  const url = new URL(request.url);

  if (isPublic(url)) return await resolve(event);

  let token: string;
  const authHeader = request.headers.get('authorization');
  if (authHeader) token = authHeader.replace(/[bB]earer\s/, '');

  if (!token) {
    const cookieHeader = request.headers.get('cookie');
    const cookies = cookieUtil.parseCookie(cookieHeader);
    token = cookies.token;
  }

  if (token) {
    let claims: any;
    try {
      claims = await jwtUtil.validate(token, JWT_SECRET);
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

  return response;
};
