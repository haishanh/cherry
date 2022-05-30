import { redirect } from '@sveltejs/kit';

import { isProtected } from '$lib/utils/access.util';

import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
  if (isProtected(url) && (!locals || !locals.user)) {
    throw redirect(307, '/signin');
  }
};
