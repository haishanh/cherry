import type { Database } from 'better-sqlite3';

export const version = 8;

export const up = (db: Database) => {
  db.prepare(`drop index if exists idx_bookmark_stash_key`).run();
  db.prepare(`create unique index if not exists idx_bookmark_stash_key_unique on bookmark_stash (key, userId)`).run();
};
