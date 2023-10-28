import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

import { ensureUser, notFound } from '$lib/server/handlers/helper';
import { wrap } from '$lib/server/handlers/wrap';
import { getJobService } from '$lib/server/services/registry';

export const GET: RequestHandler = async (event) => {
  return wrap(event, async (event) => {
    const user = ensureUser(event);
    const jobId = parseInt(event.params.id, 10);
    const jobSrv = getJobService();
    const job = jobSrv.get({ id: jobId });
    if (job.userId !== user.userId) return notFound();
    return json(job);
  });
};
