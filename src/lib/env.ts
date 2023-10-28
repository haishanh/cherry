import 'dotenv/config';

const env = process.env;

export const DATABASE_PATH = (process.env.DATABASE_PATH as string) || '/data/cherry.sqlite';
// Directory to save files, like temporary exported files
export const DATA_DIR = (process.env.DATA_DIR as string) || '/data';
export const ENABLE_PUBLIC_REGISTRATION = process.env.ENABLE_PUBLIC_REGISTRATION === '1';
export const JWT_SECRET = process.env.JWT_SECRET as string;
export const USE_INSECURE_COOKIE = process.env.USE_INSECURE_COOKIE === '1';

// remote user support
export const ENABLE_HTTP_REMOTE_USER = env.ENABLE_HTTP_REMOTE_USER === '1';
export const HTTP_REMOTE_USER_HEADER_NAME = (env.HTTP_REMOTE_USER_HEADER_NAME as string) || 'Remote-User';

export const COOKIE_KEY_TOKEN = 'token';
export const COOKIE_KEY_OAUTH_STATE = 'oauthstate';
export const PAGE_BOOKMARK_LIMIT = process.env.PAGE_BOOKMARK_LIMIT ? parseInt(process.env.PAGE_BOOKMARK_LIMIT, 10) : 60;

type ServerLogLevel = 'debug' | 'info' | 'warn' | 'error';
export const LOG_LEVEL: ServerLogLevel = (process.env.LOG_LEVEL as ServerLogLevel) || 'warn';

// prettier-ignore
// https://accounts.google.com/.well-known/openid-configuration
export const GOOGLE_OAUTH_TOKEN_ENDPOINT = (process.env.GOOGLE_OAUTH_TOKEN_ENDPOINT as string) || 'https://oauth2.googleapis.com/token';
export const GOOGLE_OAUTH_CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID as string;
// prettier-ignore
export const GOOGLE_OAUTH_CLIENT_SECRET = (process.env.GOOGLE_OAUTH_CLIENT_SECRET) as string;
// prettier-ignore
export const GOOGLE_OAUTH_REDIRECT_URI = (process.env.GOOGLE_OAUTH_REDIRECT_URI) as string;

// favicon
const ONEMONTH_SECOND_STR = '2592000';
const THREEDAY_SECOND_STR = '259200';
export const FAVICON_CACHE_MAX_AGE_FOUND = process.env.CACHE_MAX_AGE_FOUND || ONEMONTH_SECOND_STR;
export const FAVICON_CACHE_MAX_AGE_MISS = process.env.CACHE_MAX_AGE_FOUND || THREEDAY_SECOND_STR;
export const HTTP_PROXY = (process.env.HTTP_PROXY || process.env.http_proxy) as string;
