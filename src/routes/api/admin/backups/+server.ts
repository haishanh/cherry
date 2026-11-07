import type { RequestHandler } from '@sveltejs/kit';

import { ensureAdminUser } from '#lib/server/handlers/helper.js';
import { wrap } from '#lib/server/handlers/wrap.js';
import { getAdminService } from '#lib/server/services/registry.js';

export const POST: RequestHandler = async (event) => {
  return wrap(event, async (event) => {
    await ensureAdminUser(event);
    const ret = await getAdminService().backupDb();
    return Response.json(ret);
  });
};
