import type { RequestHandler } from '@sveltejs/kit';

import { ValidationErrorBuilder } from '$lib/server/api.error';
import { requestBody, signInUser } from '$lib/server/handlers/helper';
import { wrap } from '$lib/server/handlers/wrap';
import { user as userSvc } from '$lib/server/services/user.service';

export const POST: RequestHandler = async (event) => {
  return wrap(event, async (event) => {
    const body = await requestBody(event);
    const { username, password } = body;
    const v = new ValidationErrorBuilder();
    if (!username) return v.add('username', 'Invalid username').response();
    if (!password) return v.add('password', 'Invalid password').response();
    const user = await userSvc.checkPassword({ username, password });
    return signInUser(user);
  });
};
