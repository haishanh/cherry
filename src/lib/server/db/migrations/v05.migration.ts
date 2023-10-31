import type { Database } from 'better-sqlite3';

import { hasColumn } from '../common.db';

export const version = 5;

export const up = (db: Database) => {
  if (!hasColumn(db, { table: 'user', column: 'attr' })) {
    db.prepare('ALTER TABLE user ADD attr INTEGER DEFAULT 0').run();
  }
};
