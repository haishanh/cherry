import 'dotenv/config';

export const COINGECKO_BASEURL = (process.env.COINGECKO_BASEURL || 'https://api.coingecko.com/api/v3') as string;
export const TELEGRAM_JWT = process.env.TELEGRAM_JWT as string;
