import type { RequestHandler } from '@sveltejs/kit';

import { ApiError, HttpStatus } from '#lib/server/api.error.js';
import { ensureAdminUser, ensureUser, genPat, requestBody } from '#lib/server/handlers/helper.js';
import { wrap } from '#lib/server/handlers/wrap.js';
import { getUserService } from '#lib/server/services/registry.js';
import type { UserMe } from '#lib/type.js';

export const GET: RequestHandler = async (event) => {
  return wrap(event, async (event) => {
    const userId = (await ensureAdminUser(event)).id;
    // const userSrv = getUserService();
    // const user0 = userSrv.getUserByIdWithHydratedFeature({ id: userId });
    // const { token } = await genPat({ id: user0.id, username: user0.username, feature: user0.feature });
    // const { password, ...userRestProps } = user0;
    // const user: UserMe = { ...userRestProps, passwordless: password ? false : true };
    return Response.json({ userId });
  });
};
