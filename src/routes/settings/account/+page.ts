import { error } from '@sveltejs/kit';

import type { PageLoad } from './$types';

export const load: PageLoad = async (input) => {
  const fetch = input.fetch;
  const res = await fetch(`/api/user/v1`);
  if (res.ok) {
    return await res.json();
  }
  throw error(res.status, 'page failed to load');
};
