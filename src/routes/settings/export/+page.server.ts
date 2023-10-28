// import { error } from '@sveltejs/kit';

import { ensureUser } from '$lib/server/handlers/helper';
import { getJobService } from '$lib/server/services/registry';
import { JobOperation } from '$lib/type';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (input) => {
  const user = ensureUser(input);
  const jobSrv = getJobService();
  const jobs = jobSrv.all({ userId: user.userId, op: JobOperation.Export, limit: 10 });
  input.depends('jobSrv.all');
  return { jobs };
  // throw error(404, 'Not found');
};
