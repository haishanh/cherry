import type { RequestHandler } from '@sveltejs/kit';

import { ensureUser } from '#lib/server/handlers/helper.js';
import { wrap } from '#lib/server/handlers/wrap.js';
import { tag as tagSvc } from '#lib/server/services/tag.service.js';

export const GET: RequestHandler = async (event) => {
  return wrap(event, async (event) => {
    const user = ensureUser(event);
    const data = tagSvc.getAllTags({ userId: user.userId });
    return Response.json({ data });
  });
};
