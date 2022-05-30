import type { RequestHandler } from '@sveltejs/kit';

import { ENABLE_PUBLIC_REGISTRATION } from '$lib/env';
import { createUser, requestBody } from '$lib/server/handlers/helper';
import { wrap } from '$lib/server/handlers/wrap';

export const POST: RequestHandler = async (event) => {
  return wrap(event, async (event) => {
    if (!ENABLE_PUBLIC_REGISTRATION) return new Response(undefined, { status: 400 });
    const body = await requestBody(event);
    return await createUser(body);
  });
};
