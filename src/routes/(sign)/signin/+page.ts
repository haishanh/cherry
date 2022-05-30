import type { PageLoad } from './$types';

export const load: PageLoad = async (input) => {
  const fetch = input.fetch;
  const res = await fetch('/api/public/server/settings');
  if (res.ok) {
    const config = await res.json();
    return {
      registration: config.registration,
    };
  }
  return { registration: false };
};
