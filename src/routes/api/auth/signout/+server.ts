import type { RequestHandler } from '@sveltejs/kit';

import { COOKIE_KEY_TOKEN } from '$lib/env';

export const GET: RequestHandler = async () => {
  const headers = new Headers();
  headers.append('set-cookie', `${COOKIE_KEY_TOKEN}=deleted; Secure; Path=/; SameSite=Lax; Max-Age=0; HttpOnly`);
  headers.append('location', '/');
  return new Response(undefined, { status: 307, headers });
};
