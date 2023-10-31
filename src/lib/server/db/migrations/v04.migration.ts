import type Sqlite from 'better-sqlite3';

import { index, table } from '../builder';

export const version = 4;

export const up = (db: Sqlite.Database) => {
  db.prepare(
    table.create({
      name: 'job',
      ifNotExists: true,
      column: {
        id: 'integer PRIMARY KEY AUTOINCREMENT',
        userId: 'integer',
        op: 'text', // operation, ex. "export"
        // 'PENDING' | 'IN_PROGRESS' | 'FINISHED',
        status: 'text',
        exp: 'integer', // Expiration time, unix epoch in seconds
        input: 'text', // json stringified text
        output: 'text', // json stringified text
        error: 'text',
        createdAt: 'integer',
        finishedAt: 'integer',
      },
    }),
  ).run();

  db.prepare(
    index.create({
      name: 'job_idx_userId',
      ifNotExists: true,
      table: 'job',
      columns: ['userId'],
    }),
  ).run();
};
