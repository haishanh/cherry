import type { Load } from '@sveltejs/kit';

export const load: Load = async (input) => {
  const fetch = input.fetch;

  const qs0 = input.url.searchParams;
  const q0 = qs0.get('q');

  let res: Response;
  if (q0) {
    res = await fetch(`/api/search?${qs0}`);
  } else {
    res = await fetch(`/api/bookmarks?${qs0}`);
  }

  if (res.ok) {
    const { data, meta } = await res.json();
    console.log('home.load', meta);

    return {
      props: { bookmarks: data, meta },
    };
  }

  return {
    status: res.status,
    error: new Error(`Could not load`),
  };
};
