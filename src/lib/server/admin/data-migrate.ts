import type Sqlite from 'better-sqlite3';

import { lite } from '$lib/server/db/common.db';

function table(from: Sqlite.Database, to: Sqlite.Database, name: string, columnsToIgnore: string[] = []) {
  const stmt = from.prepare(`SELECT * FROM ${name}`);
  let insertStmt: Sqlite.Statement;
  let columns: string[];
  const run = to.transaction(() => {
    for (const row of stmt.iterate()) {
      if (!insertStmt) {
        columns = Object.keys(row).filter((col) => columnsToIgnore.indexOf(col) < 0);
        const colCsv = columns.join(',');
        console.log(`table ${name} columns ${colCsv}`);
        const placeholderCsv = columns.map(() => '?').join(',');
        insertStmt = to.prepare(`insert into ${name} (${colCsv}) values (${placeholderCsv})`);
      }
      const params = columns.map((k) => row[k]);
      try {
        insertStmt.run(params);
      } catch (e) {
        if (e.code === 'SQLITE_CONSTRAINT_UNIQUE' && name === 'bookmark') {
          // ignore
          // some conflicts are expected as we added more constraints
        } else {
          console.log(e, e.code);
          console.log({ statement: insertStmt, params });
          throw e;
        }
      }
    }
  });
  run();
}

export function migrateData(input: { fromFilePath: string; toFilePath: string }) {
  const fromDb = lite(input.fromFilePath, false, false);
  const toDb = lite(input.toFilePath, true, false);
  table(fromDb, toDb, 'user', ['bookmarkCount', 'bookmarkCountSyncedAt']);
  table(fromDb, toDb, 'tag', ['count']);
  table(fromDb, toDb, 'cherry_group', ['count']);
  table(fromDb, toDb, 'bookmark_tag');
  // migrate bookmark in last step to ensure all bookmark trigger can run with required table exists
  table(fromDb, toDb, 'bookmark');
}
