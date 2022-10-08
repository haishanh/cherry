import type { RequestHandler } from '@sveltejs/kit';
import { ZodError, ZodSchema } from 'zod';

import { dev } from '$app/environment';
import { COOKIE_KEY_TOKEN, JWT_SECRET, USE_INSECURE_COOKIE } from '$lib/env';
import { logger } from '$lib/server/logger';
import { user as userSvc } from '$lib/server/services/user.service';
import { isEmail } from '$lib/utils/common.util';
import * as cookieUtil from '$lib/utils/cookie.util';
import * as jwtUtil from '$lib/utils/jwt.util';

import { ApiError, ApiErrorCode, HttpStatus, ValidationErrorBuilder } from '../api.error';

type Event = Parameters<RequestHandler>[0];

export async function requestBody(event: Event) {
  try {
    return await event.request.json();
  } catch (e) {
    logger.info({ error: e });
    throw new ApiError(HttpStatus.BAD_REQUEST, ApiErrorCode.InvalidRequestBody);
  }
}

export function ensureUser(event: Event): { userId: number; feature: number } {
  const user = event.locals?.user;
  if (!user || !user.userId) throw new Response(undefined, { status: HttpStatus.UNAUTHORIZED });
  return user;
}

export function ensureInt(provideId: any) {
  if (!provideId) throw new Response(undefined, { status: HttpStatus.BAD_REQUEST });
  const id = parseInt(provideId, 10);
  if (isNaN(id)) throw new Response(undefined, { status: HttpStatus.BAD_REQUEST });
  return id;
}

export async function createUser(input: { username: string; password: string }) {
  const { username, password } = input;
  const v = new ValidationErrorBuilder();
  if (!username) return v.add('username', 'Invalid username').response();
  if (!isEmail(username)) return v.add('username', 'Username must be an email').response();
  if (!password) return v.add('password', 'Invalid password').response();
  const user = await userSvc.createUser({ username, password });
  return signInUser(user);
}

export async function genPat(user: { id: number; username: string; feature: number }) {
  const { id, username, feature } = user;
  const token = await jwtUtil.generate({ userId: id, username, feature }, JWT_SECRET);
  const maxAge = 30 * 24 * 3600;
  return { token, maxAge };
}

export async function signInUser(user: { id: number; username: string; feature: number }, redirect?: string) {
  const { token, maxAge } = await genPat(user);
  const headers = new Headers();
  // https://web.dev/first-party-cookie-recipes/
  headers.append(
    'set-cookie',
    cookieUtil.gen(COOKIE_KEY_TOKEN, token, { maxAge, insecure: USE_INSECURE_COOKIE || dev })
  );
  // remove oauthstate cookie
  // `oauthstate=deleted; Path=/; SameSite=Lax; Max-Age=0; HttpOnly`,
  if (redirect) headers.append('location', redirect);
  return new Response(undefined, { status: redirect ? 303 : 204, headers });
}

export function zalidate<T>(schema: ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (e) {
    if (!(e instanceof ZodError)) throw e;
    const err = e.errors[0];
    throw new ApiError(400, undefined, `Invalid ${err.path.join('.')}`);
  }
}
