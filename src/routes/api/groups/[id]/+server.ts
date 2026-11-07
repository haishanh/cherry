import type { RequestHandler } from '@sveltejs/kit';

import { ensureInt, ensureUser, requestBody, zalidate } from '#lib/server/handlers/helper.js';
import { wrap } from '#lib/server/handlers/wrap.js';
import { group as groupSvc } from '#lib/server/services/group.service.js';
import { type InputUpdateGroup, SchemaUpdateGroup } from '#lib/type.js';

export const PATCH: RequestHandler = async (event) => {
  return wrap(event, async (event) => {
    const user = ensureUser(event);
    const id = ensureInt(event.params.id);
    const body = await requestBody(event);
    const input = zalidate(SchemaUpdateGroup, { ...body, id, userId: user.userId });
    groupSvc.updateGroupById(input as InputUpdateGroup);
    return Response.json({ id });
  });
};

export const DELETE: RequestHandler = async (event) => {
  return wrap(event, async (event) => {
    const user = ensureUser(event);
    const id = ensureInt(event.params.id);
    groupSvc.deleteGroupById({ id, userId: user.userId });
    return Response.json({ id });
  });
};
