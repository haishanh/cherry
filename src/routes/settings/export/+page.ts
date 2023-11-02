import { error } from '@sveltejs/kit';

import { JobOperation } from '$lib/type';

import type { PageLoad } from './$types';

export const load: PageLoad = async (input) => {
  const fetch = input.fetch;
  const qs = new URLSearchParams({ op: JobOperation.Export });
  const res = await fetch(`/api/jobs?${qs}`);
  if (res.ok) {
    const { items } = await res.json();
    return { jobs: items };
  }
  throw error(500, 'Could not load');
};
