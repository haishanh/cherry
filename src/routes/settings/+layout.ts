import type { UserMe } from '$lib/type';

import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async (input) => {
  const res = await input.fetch('/api/user/v1');
  let userData: { user: UserMe; token: string } | undefined;
  if (res.ok) userData = await res.json();
  if (!userData) throw new Error('userData is nullish');
  return { pathname: input.url.pathname, ...userData };
};
