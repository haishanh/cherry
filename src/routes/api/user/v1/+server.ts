import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

import { dev } from '$app/environment';
import { COOKIE_KEY_TOKEN, USE_INSECURE_COOKIE } from '$lib/env';
import { ApiError, HttpStatus } from '$lib/server/api.error';
import { ensureUser, genPat, requestBody } from '$lib/server/handlers/helper';
import { wrap } from '$lib/server/handlers/wrap';
import { getUserService } from '$lib/server/services/registry';
import { UserServiceError, UserServiceErrorCode } from '$lib/server/services/user.service';
import type { UserFromDbHydrated, UserMe } from '$lib/type';
import * as cookieUtil from '$lib/utils/cookie.util';

export const GET: RequestHandler = async (event) => {
  return wrap(event, async (event) => {
    const userId = ensureUser(event).userId;
    const userSrv = getUserService();
    let user0: UserFromDbHydrated;
    try {
      user0 = userSrv.getUserByIdWithHydratedFeature({ id: userId });
    } catch (e) {
      if (e instanceof UserServiceError && e.code === UserServiceErrorCode.UserNotFound) {
        throw makeNotFoundAndCleanCookieResponse();
      }
      throw e;
    }
    const { token } = await genPat({ id: user0.id, username: user0.username, feature: user0.feature });
    const { password, ...userRestProps } = user0;
    const user: UserMe = { ...userRestProps, passwordless: password ? false : true };
    return json({ token, user });
  });
};

// {op:'changePassword',data:{currentPassword:'',newPassword:''}}
export const POST: RequestHandler = async (event) => {
  return wrap(event, async (event) => {
    const user = ensureUser(event);
    const body = await requestBody(event);
    const op = body.op;
    if (op !== 'changePassword') {
      throw new ApiError(HttpStatus.BAD_REQUEST);
    }
    const data = body.data;
    if (typeof data.currentPassword !== 'string' || data.currentPassword === '') {
      throw new ApiError(HttpStatus.BAD_REQUEST);
    }
    if (typeof data.newPassword !== 'string' || data.newPassword === '') {
      throw new ApiError(HttpStatus.BAD_REQUEST);
    }
    const userSrv = getUserService();
    await userSrv.changePassword({ ...data, userId: user.userId });
    return new Response(undefined, { status: HttpStatus.NO_CONTENT });
  });
};

function makeNotFoundAndCleanCookieResponse() {
  return new Response(undefined, {
    status: HttpStatus.NOT_FOUND,
    headers: {
      'set-cookie': cookieUtil.gen(COOKIE_KEY_TOKEN, 'deleted', {
        maxAge: 0,
        insecure: USE_INSECURE_COOKIE || dev,
      }),
    },
  });
}
