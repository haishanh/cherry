import { error } from '@sveltejs/kit';

import type { PageLoad } from './$types';

export const load: PageLoad = async (input) => {
  const fetch = input.fetch;
  const res = await fetch('/api/groups');
  if (res.ok) {
    const { data } = await res.json();
    return { groups: data };
  }
  throw error(500, 'Could not load');
};
