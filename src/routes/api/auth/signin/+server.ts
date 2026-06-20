import type { RequestHandler } from '@sveltejs/kit';

import { requestBody, signInUser } from '$lib/server/handlers/helper';
import { wrap } from '$lib/server/handlers/wrap';
import { getUserService } from '$lib/server/services/registry';
import { ValidationErrorBuilder } from '$lib/server/validation.error';

export const POST: RequestHandler = async (event) => {
  return wrap(event, async (event) => {
    const body = await requestBody(event);
    const { username, password } = body;
    const v = new ValidationErrorBuilder();
    if (!username) return v.add('username', 'Invalid username').response();
    if (!password) return v.add('password', 'Invalid password').response();
    const userSvc = getUserService();
    const user = await userSvc.checkPassword({ username, password });
    return signInUser(user);
  });
};
