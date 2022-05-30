import type { Load } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';

export const load: Load = async (input) => {
  const fetch = input.fetch;
  const url = input.url;

  const qs = url.searchParams;
  const res = await fetch(`/api/bookmarks?${qs}`);

  if (res.ok) {
    const { data, meta } = await res.json();
    return {
      bookmarks: data.items,
      totalPage: data.totalPage,
      meta,
      url: { pathname: url.pathname, search: qs.toString() },
    };
  }

  throw error(res.status, 'Could not load');
};
