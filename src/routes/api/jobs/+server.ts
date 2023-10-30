import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

import { ApiError, HttpStatus } from '$lib/server/api.error';
import { ensureUser, requestBody } from '$lib/server/handlers/helper';
import { wrap } from '$lib/server/handlers/wrap';
import { getExportService, getJobService } from '$lib/server/services/registry';
import { JobOperation } from '$lib/type';

const ONE_DAY_SECONDS = 24 * 60 * 60;

export const POST: RequestHandler = async (event) => {
  return wrap(event, async (event) => {
    const user = ensureUser(event);
    const body = await requestBody(event);
    const op = body.op;
    if (op !== JobOperation.Export) {
      throw new ApiError(HttpStatus.BAD_REQUEST);
    }
    const now = Date.now();
    // TODO validate exp
    const exp = typeof body.exp === 'number' ? body.exp : Math.ceil(now / 1000) + ONE_DAY_SECONDS;
    // TODO validate input
    const input = body.input;

    const jobSrv = getJobService();
    // save job
    const job = jobSrv.create({
      user,
      op,
      exp,
      input,
    });

    // run the job in the background
    getExportService()
      .run(user.userId)
      .then(
        (result) => {
          jobSrv.updateOutput({
            id: job.id,
            output: result,
          });
        },
        (err) => {
          jobSrv.updateError({
            id: job.id,
            error: err.message as string,
          });
        },
      );

    return json(job);
  });
};
