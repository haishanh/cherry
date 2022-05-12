import 'dotenv/config';

export const DATABASE_PATH = (process.env.DATABASE_PATH as string) || '/data/01.db';
export const ENABLE_REGISTRATION = process.env.ENABLE_REGISTRATION === '1';
export const COOKIE_SECRET = process.env.COOKIE_SECRET as string;

export const PAGE_BOOKMARK_LIMIT = 60;

// prettier-ignore
export const GITHUB_OAUTH_CLIENT_ID = (process.env.GITHUB_OAUTH_CLIENT_ID) as string;
// prettier-ignore
export const GITHUB_OAUTH_CLIENT_SECRET = (process.env.GITHUB_OAUTH_CLIENT_SECRET) as string;
// prettier-ignore
export const GITHUB_OAUTH_REDIRECT_URI = (process.env.GITHUB_OAUTH_REDIRECT_URI) as string;

export const GOOGLE_OAUTH_CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID as string;
// prettier-ignore
export const GOOGLE_OAUTH_CLIENT_SECRET = (process.env.GOOGLE_OAUTH_CLIENT_SECRET) as string;
// prettier-ignore
export const GOOGLE_OAUTH_REDIRECT_URI = (process.env.GOOGLE_OAUTH_REDIRECT_URI) as string;
