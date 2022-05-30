import type { RequestHandler } from '@sveltejs/kit';

import { COOKIE_KEY_TOKEN } from '$lib/env';
import { HttpStatus } from '$lib/server/api.error';
import { ensureUser, genPat, requestBody } from '$lib/server/handlers/helper';
import { wrap } from '$lib/server/handlers/wrap';
import { user as userSvc, UserFeatureFlag } from '$lib/server/services/user.service';

export const POST: RequestHandler = async (event) => {
  return wrap(event, async (event) => {
    const u0 = ensureUser(event);
    const userId = u0.userId;
    const body = await requestBody(event);
    // ensure user exists in DB
    const user = userSvc.getUserById({ id: userId });

    const stp = body.strip_tracking_parameters;
    const currentStp = (user.feature & UserFeatureFlag.FF_STRIP_TRACKING_PARAMETERS) > 0;

    let feature = user.feature;

    if (stp && !currentStp) {
      // set it on
      feature = user.feature | UserFeatureFlag.FF_STRIP_TRACKING_PARAMETERS;
    } else if (!stp && currentStp) {
      // set it off
      feature = user.feature & ~UserFeatureFlag.FF_STRIP_TRACKING_PARAMETERS;
    }

    if (feature !== user.feature) {
      userSvc.updateFeature({ userId, feature });
      const cookies = event.cookies;
      const { token, maxAge } = await genPat({ ...user, feature });
      cookies.set(COOKIE_KEY_TOKEN, token, { maxAge, path: '/' });
    }

    return new Response(undefined, { status: HttpStatus.NO_CONTENT });
  });
};
