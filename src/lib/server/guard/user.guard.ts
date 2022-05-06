import type { RequestHandler } from '@sveltejs/kit';

export function ensureLoggedIn(event: Parameters<RequestHandler>[0]) {
  const userId = event.locals?.user?.userId;
  return {
    userId,
    handle: () => ({ status: 401 }),
  };
}
