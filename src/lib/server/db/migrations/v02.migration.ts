import type Sqlite from 'better-sqlite3';

import { hasColumn } from '../common.db';

export const version = 2;

export const up = (db: Sqlite.Database) => {
  if (!hasColumn(db, { table: 'user', column: 'feature' })) {
    db.prepare('ALTER TABLE user ADD feature INTEGER DEFAULT 0').run();
  }
};
