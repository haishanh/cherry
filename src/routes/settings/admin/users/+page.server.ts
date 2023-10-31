import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (input) => {
  await input.parent();
  return {};
};
