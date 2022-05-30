import { error } from '@sveltejs/kit';

import type { PageLoad } from './$types';

export const load: PageLoad = async (input) => {
  const fetch = input.fetch;
  const id = input.params.id;
  const res = await fetch('/api/bookmarks/' + id);
  if (res.ok) return { bookmark: await res.json() };
  if (res.status === 404) return {};
  throw error(500, `Could not load`);
};
