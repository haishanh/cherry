import type { RequestHandler } from '@sveltejs/kit';
import { COOKIE_SECRET } from '$lib/env';
import * as jwtUtil from '$lib/utils/jwt.util';
import { ensureLoggedIn } from '$lib/server/guard/user.guard';

export const get: RequestHandler = async (event) => {
  const eli = ensureLoggedIn(event);
  const userId = eli.userId;
  if (!userId) return eli.handle();

  const token = await jwtUtil.sign({ userId }, COOKIE_SECRET);

  return { status: 200, body: { token } };
};
