import type { RequestHandler } from '@sveltejs/kit';

import { HttpStatus } from '#lib/server/api.error.js';
import { ensureInt, ensureUser, requestBody } from '#lib/server/handlers/helper.js';
import { wrap } from '#lib/server/handlers/wrap.js';
import { tag as tagSvc } from '#lib/server/services/tag.service.js';

export const PATCH: RequestHandler = async (event) => {
  return wrap(event, async (event) => {
    const user = ensureUser(event);
    const id = ensureInt(event.params.id);
    const body = await requestBody(event);
    const input = { ...validateUpdateTagBody(body), id, userId: user.userId };
    tagSvc.updateTagById(input);
    return Response.json({ id });
  });
};

export const DELETE: RequestHandler = async (event) => {
  return wrap(event, async (event) => {
    const user = ensureUser(event);
    const id = ensureInt(event.params.id);
    tagSvc.deleteTagById({ id, userId: user.userId });
    return Response.json({ id });
  });
};

export const GET: RequestHandler = async (event) => {
  return wrap(event, async (event) => {
    const user = ensureUser(event);
    const ids = (event.params.id || '').split(',').map(ensureInt);
    if (ids.length === 0) return [];
    const userId = user.userId;
    const items = tagSvc.batchGetTags({ userId, ids });
    return Response.json({ items });
  });
};

///// helpers

function validateUpdateTagBody(body: any) {
  if (body && body.name && typeof body.name === 'string') return body;
  return new Response(undefined, { status: HttpStatus.BAD_REQUEST });
}
