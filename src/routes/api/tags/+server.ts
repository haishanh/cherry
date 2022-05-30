import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

import { ensureUser } from '$lib/server/handlers/helper';
import { wrap } from '$lib/server/handlers/wrap';
import { tag as tagSvc } from '$lib/server/services/tag.service';

export const GET: RequestHandler = async (event) => {
  return wrap(event, async (event) => {
    const user = ensureUser(event);
    const data = tagSvc.getAllTags({ userId: user.userId });
    return json({ data });
  });
};
