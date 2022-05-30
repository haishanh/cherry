import { randomUUID } from 'crypto';
import dbg from 'debug';

import {
  GOOGLE_OAUTH_CLIENT_ID,
  GOOGLE_OAUTH_CLIENT_SECRET,
  GOOGLE_OAUTH_REDIRECT_URI,
  GOOGLE_OAUTH_TOKEN_ENDPOINT,
} from '$lib/env';

const debug = dbg('cherry:util:oidc');

export function authCodeUrl() {
  const state = randomUUID();

  const q = new URLSearchParams({
    response_type: 'code',
    client_id: GOOGLE_OAUTH_CLIENT_ID,
    redirect_uri: GOOGLE_OAUTH_REDIRECT_URI,
    scope: 'openid email',
    state,
  });

  // find "authorization_endpoint" on
  // https://accounts.google.com/.well-known/openid-configuration
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${q}`;
  return { authUrl, state };
}

export async function exchangeToken({ code }) {
  const q = new URLSearchParams({
    code,
    grant_type: 'authorization_code',
    client_id: GOOGLE_OAUTH_CLIENT_ID,
    client_secret: GOOGLE_OAUTH_CLIENT_SECRET,
    redirect_uri: GOOGLE_OAUTH_REDIRECT_URI,
  });

  const url = GOOGLE_OAUTH_TOKEN_ENDPOINT;

  debug('exchanging token');

  const res = await fetch(url, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
    body: q.toString(),
  });

  debug('token response status %s', res.status);

  const json = await res.json();
  return json;
}

export function extractEmail(idToken: string) {
  const [, cStr] = idToken.split('.');
  const claims = JSON.parse(Buffer.from(cStr, 'base64').toString());
  return claims.email;
}
