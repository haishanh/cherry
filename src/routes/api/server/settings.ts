import type { RequestHandler } from '@sveltejs/kit';

import { ENABLE_REGISTRATION } from '$lib/env';

export const get: RequestHandler = async () => {
  return {
    status: 200,
    body: {
      registration: ENABLE_REGISTRATION,
    },
  };
};
