import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

import { ensureUser, requestBody, zalidate } from '$lib/server/handlers/helper';
import { wrap } from '$lib/server/handlers/wrap';
import { group as groupSvc } from '$lib/server/services/group.service';
import { type InputCreateGroup, SchemaCreateGroup } from '$lib/type';

export const GET: RequestHandler = async (event) => {
  return wrap(event, async (event) => {
    const user = ensureUser(event);
    const data = groupSvc.all({ userId: user.userId });
    return json({ data });
  });
};

export const POST: RequestHandler = async (event) => {
  return wrap(event, async (event) => {
    const user = ensureUser(event);
    const body = await requestBody(event);
    const input = zalidate(SchemaCreateGroup, { ...body, userId: user.userId });
    const data = groupSvc.upsert(input as InputCreateGroup);
    return json(data, { status: 200 });
  });
};

// upsert a group
// export const PUT: RequestHandler = async (event) => {
//   return wrap(event, async (event) => {
//     const userId = ensureUser(event);
//     const body = await requestBody(event);
//     const [err, input] = validate({ ...body, userId }, StructCreateGroup);
//     if (err) throw new ApiError(400, undefined, `Invalid ${err.path.join('.')}`);
//     const data = groupSvc.upsert(input);
//     return json(data, { status: 200 });
//   });
// };
