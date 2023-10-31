import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

import { ensureAdminUser } from '$lib/server/handlers/helper';
import { wrap } from '$lib/server/handlers/wrap';
import { getAdminService } from '$lib/server/services/registry';

export const POST: RequestHandler = async (event) => {
  return wrap(event, async (event) => {
    ensureAdminUser(event);
    const ret = await getAdminService().backupDb();
    return json(ret);
  });
};
