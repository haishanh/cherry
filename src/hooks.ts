import type { GetSession, Handle } from '@sveltejs/kit';
import * as cookieUtil from '$lib/utils/cookie.util';
import * as jwtUtil from '$lib/utils/jwt.util';
import { logger } from '$lib/server/logger';
import { COOKIE_SECRET } from '$lib/env';

export const getSession: GetSession = (event) => {
  return event.locals.user ? { user: event.locals.user } : {};
};

export const handle: Handle = async function handle({ event, resolve }) {
  const request = event.request;
  const url = new URL(request.url);

  // logger.info('request', request.url);

  if (url.pathname === '/login' || url.pathname === '/api/ping' || url.pathname.startsWith('/api/auth/')) {
    return await resolve(event);
  }

  const cookieHeader = request.headers.get('cookie');
  const cookies = cookieUtil.parseCookie(cookieHeader);
  let token = cookies.token;

  if (!token) {
    const authHeader = request.headers.get('authorization');
    if (authHeader) token = authHeader.replace(/[bB]earer\s/, '');
  }

  if (token) {
    let claims: any;
    try {
      claims = await jwtUtil.verify(token, COOKIE_SECRET);
    } catch (e) {
      logger.info(e);
      const res = new Response(undefined, { status: 403 });
      return res;
    }
    event.locals.user = claims;
  }

  const response = await resolve(event);

  // if we use something like:
  //
  // return new Response(undefined, {status: 307, headers: {'set-cookie': 'xx', 'location': 'yy'}})
  //
  // it works in "dev", but not in "prod" -_-||
  // in "prod", the page will return something like:
  //
  // <meta http-equiv="refresh" content="0;url=/login">
  //
  // we lost our redirect set-cookie header
  if (response.status === 307) {
    const ONE_DAY_IN_SECOND = 24 * 3600;
    const cookie = `redirect=${request.url}; Path=/; SameSite=Lax; Max-Age=${ONE_DAY_IN_SECOND}; HttpOnly`;
    response.headers.append('set-cookie', cookie);
  }

  return response;
};
