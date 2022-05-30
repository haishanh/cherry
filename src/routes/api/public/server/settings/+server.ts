import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

import { ENABLE_PUBLIC_REGISTRATION } from '$lib/env';

// TODO should be replaced with public/env
export const GET: RequestHandler = async () => {
  return json({ registration: ENABLE_PUBLIC_REGISTRATION });
};
