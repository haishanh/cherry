import type { Database } from 'better-sqlite3';

export const version = 6;

// Active v6 migration for the signal_tokenizer path.
// It only tears down the legacy bookmark_fts layout created before v6.

export const up = (db: Database) => {
  db.prepare(`drop trigger if exists bookmark_insert_trigger`).run();
  db.prepare(`drop trigger if exists bookmark_delete_trigger`).run();
  db.prepare(`drop trigger if exists bookmark_update_trigger`).run();
  db.prepare(`drop table if exists bookmark_fts`).run();
};
