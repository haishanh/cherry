import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

import { ensureUser, notFound } from '$lib/server/handlers/helper';
import { wrap } from '$lib/server/handlers/wrap';
import { getJobService } from '$lib/server/services/registry';
import { ApiError, HttpStatus } from '$lib/server/api.error';

export const GET: RequestHandler = async (event) => {
  return wrap(event, async (event) => {
    const user = ensureUser(event);
    if (typeof event.params.id !== 'string') {
      throw new ApiError(HttpStatus.BAD_REQUEST);
    }
    const jobId = parseInt(event.params.id, 10);
    if (isNaN(jobId)) {
      throw new ApiError(HttpStatus.BAD_REQUEST);
    }
    const jobSrv = getJobService();
    const job = jobSrv.get({ id: jobId });
    if (job.userId !== user.userId) return notFound();
    return json(job);
  });
};
