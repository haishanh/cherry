import type { Load } from '@sveltejs/kit';

export const load: Load = async (input) => {
  const fetch = input.fetch;

  const qs0 = input.url.searchParams;
  const q0 = qs0.get('q');
  // rebuild this to ensure we only include what we want
  const qs1 = new URLSearchParams({ q: q0 });

  let res: Response;
  if (q0) {
    res = await fetch(`/api/search?${qs1}`);
  } else {
    res = await fetch('/api/bookmarks');
  }

  if (res.ok) {
    const bookmarks = await res.json();
    return { props: { bookmarks } };
  }

  return {
    status: res.status,
    error: new Error(`Could not load`),
  };
};
