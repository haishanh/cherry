import 'dotenv/config';

export const DATABASE_PATH = (process.env.DATABASE_PATH as string) || '/data/01.db';
