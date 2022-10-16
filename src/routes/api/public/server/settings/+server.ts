import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

import {
  ENABLE_PUBLIC_REGISTRATION,
  GOOGLE_OAUTH_CLIENT_ID,
  GOOGLE_OAUTH_CLIENT_SECRET,
  GOOGLE_OAUTH_REDIRECT_URI,
  GOOGLE_OAUTH_TOKEN_ENDPOINT,
} from '$lib/env';

export const GET: RequestHandler = async () => {
  return json({
    registration: ENABLE_PUBLIC_REGISTRATION,
    googleOauthEnabled:
      GOOGLE_OAUTH_CLIENT_ID && GOOGLE_OAUTH_CLIENT_SECRET && GOOGLE_OAUTH_REDIRECT_URI && GOOGLE_OAUTH_TOKEN_ENDPOINT,
  });
};
