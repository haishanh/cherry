import type { RequestHandler } from '@sveltejs/kit';
import * as z from 'zod';

import { logger } from '$lib/server/logger';
import { isEmail } from '$lib/utils/common.util';

import { ApiError, ApiErrorCode, HttpStatus } from '../api.error';
import { signInUser } from '../session';
import { getUserService } from '../services/user.registry';
import { ValidationErrorBuilder } from '../validation.error';

export { genPat, signInUser } from '../session';

type Event = Parameters<RequestHandler>[0];

export async function requestBody(event: Event) {
  try {
    return await event.request.json();
  } catch (e) {
    logger.info({ error: e });
    throw new ApiError(HttpStatus.BAD_REQUEST, ApiErrorCode.InvalidRequestBody);
  }
}

export function notFound() {
  throw new Response(undefined, { status: HttpStatus.NOT_FOUND });
}

export function forbidden() {
  throw new Response(undefined, { status: HttpStatus.FORBIDDEN });
}

function unauthorizedError() {
  return new Response(undefined, { status: HttpStatus.UNAUTHORIZED });
}

export function unauthorized() {
  throw unauthorizedError();
}

export function ensureUser(event: Event): { userId: number; feature: number } {
  const user = event.locals?.user;
  if (!user || !user.userId) throw unauthorizedError();
  return user;
}

export async function ensureAdminUser(event: Event) {
  const user = event.locals?.user;
  const id = user?.id || user?.userId;
  if (!id) throw unauthorizedError();
  const userSrv = getUserService();
  const maybeAdminUser = userSrv.getUserByIdWithHydratedFeature({ id });
  if (maybeAdminUser.attr.admin !== true) unauthorized();
  return maybeAdminUser;
}

export function ensureInt(provideId: any) {
  if (!provideId) throw new Response(undefined, { status: HttpStatus.BAD_REQUEST });
  const id = parseInt(provideId, 10);
  if (isNaN(id)) throw new Response(undefined, { status: HttpStatus.BAD_REQUEST });
  return id;
}

export async function createUser(input: { username: string; password: string; options?: { admin: boolean } }) {
  const { username, password } = input;
  const options = input?.options || { admin: false };
  const v = new ValidationErrorBuilder();
  if (!username) return v.add('username', 'Invalid username').response();
  if (!isEmail(username)) return v.add('username', 'Username must be an email').response();
  if (!password) return v.add('password', 'Invalid password').response();
  const userSrv = getUserService();
  const user = await userSrv.createUser({ username, password, options });
  return signInUser(user);
}

export function zalidate<
  T extends {
    parse: (d: unknown) => z.infer<T>;
  },
>(schema: T, data: unknown) {
  try {
    return schema.parse(data);
  } catch (e) {
    if (!(e instanceof z.ZodError)) throw e;
    const err = e.issues[0];
    throw new ApiError(400, undefined, `Invalid ${err.path.join('.')}`);
  }
}
