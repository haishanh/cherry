import type Sqlite from 'better-sqlite3';

import type { InputBatchUpsertBookmarkTag } from '$lib/type';

import { BookmarkTagQueryInsertV0 } from './querystring';

export function batchUpsertBookmarkTag(db: Sqlite.Database, input: InputBatchUpsertBookmarkTag) {
  const stmt = db.prepare(BookmarkTagQueryInsertV0);
  const { items } = input;
  const transact = db.transaction(() => {
    for (const item of items) {
      try {
        stmt.run(item);
      } catch (e) {
        // ignore
      }
    }
  });
  transact();
}
