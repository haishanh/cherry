import { error } from '@sveltejs/kit';

import type { PageLoad } from './$types';

export const load: PageLoad = async (input) => {
  const fetch = input.fetch;
  const res = await fetch(`/api/tags`);
  if (res.ok) {
    const { data } = await res.json();
    return { tags: data };
  }
  throw error(500, `Could not load`);
};
