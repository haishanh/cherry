import { dev } from '$app/environment';
import { COOKIE_KEY_TOKEN, JWT_SECRET, USE_INSECURE_COOKIE } from '$lib/env';
import * as cookieUtil from '$lib/utils/cookie.util';
import * as jwtUtil from '$lib/utils/jwt.util';

export async function genPat(user: { id: number; username: string; feature: number }) {
  const { id, username, feature } = user;
  const token = await jwtUtil.generate({ userId: id, username, feature }, JWT_SECRET);
  const maxAge = 30 * 24 * 3600;
  return { token, maxAge };
}

export async function signInUser(user: { id: number; username: string; feature: number }, redirect?: string) {
  const { token, maxAge } = await genPat(user);
  const headers = new Headers();
  headers.append(
    'set-cookie',
    cookieUtil.gen(COOKIE_KEY_TOKEN, token, { maxAge, insecure: USE_INSECURE_COOKIE || dev }),
  );
  if (redirect) headers.append('location', redirect);
  return new Response(undefined, { status: redirect ? 303 : 204, headers });
}
