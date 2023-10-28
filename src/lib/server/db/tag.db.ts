import Sqlite from 'better-sqlite3';

import { logger } from '$lib/server/logger';
import type {
  BookmarkFromDb,
  InputBatchGetTags,
  InputBatchUpsertTag,
  InputBatchUpsertTagItem,
  InputCreateBookmarkTag,
  InputCreateTag,
  InputDeleteBookmarkTag,
  InputDeleteTag,
  InputGetAllTags,
  InputUpdateTag,
  TagFromDb,
} from '$lib/type';

import { Eq, OrderByDir, select_from } from './builder2';
import { DataError, DataErrorCode } from './common.db';
import { Column, Table } from './identifier';
import { BookmarkTagQueryDeleteV0, BookmarkTagQueryInsertV0 } from './querystring';

export const BookmarkTagQuerySelectV0 = 'select bookmarkId,tagId from bookmark_tag where bookmarkId = ?';

// const TagQuerySelectV0 = 'select id, name, count from tag where userId = @userId order by id desc';
// const TagQuerySelectV1 = 'select id, name from tag where id = ?';
// const TagQuerySelectV2 = 'select id from tag where userId = @userId and name = @name';
const TagQueryInsertV0 = `insert into tag (name, userId, createdAt, updatedAt) values (@name, @userId, strftime('%s','now'), strftime('%s','now'))`;
const TagQueryInsertV1 = `insert into tag (name, userId, createdAt, updatedAt) values (?, ?, strftime('%s','now'), strftime('%s','now'))`;

export function hydrateBookmarks(db: Sqlite.Database, bookmarks: BookmarkFromDb[]): BookmarkFromDb[] {
  const stmt = db.prepare(BookmarkTagQuerySelectV0);
  const transact = db.transaction((bookmarkIds: number[]) => bookmarkIds.map((id) => stmt.all(id)));
  const bookmarkTags = transact(bookmarks.map((b) => b.id)) as { bookmarkId: number; tagId: number }[][];
  bookmarks.forEach((bookmark, i) => (bookmark.tagIds = bookmarkTags[i].map((bt) => bt.tagId)));
  return bookmarks;
}

// TODO move to bookmarkTag.db.ts
export function createBookmarkTag(db: Sqlite.Database, opts: InputCreateBookmarkTag) {
  const stmt = db.prepare(BookmarkTagQueryInsertV0);
  try {
    stmt.run(opts);
  } catch (e) {
    logger.error({ error: e });
    throw e;
  }
}

export function getTagByName(db: Sqlite.Database, input: { name: string; userId: number }) {
  const stmt = db.prepare('select id, name from tag where userId = ? AND name = ?');
  return stmt.get([input.userId, input.name]) as { id: number; name: string };
}

export function getAllTags(db: Sqlite.Database, opts: InputGetAllTags) {
  const cols = Column.Tag;
  const ret = select_from(Table.Tag, [cols.Id, cols.Name, cols.Count])
    .where(Eq(cols.UserId, opts.userId))
    .orderBy(cols.Id, OrderByDir.Descending)
    .build();
  const stmt = db.prepare(ret.source);
  return stmt.all(ret.params) as Array<{
    id: number;
    name: string;
    count: number;
  }>;
}

export function batchGetTags(db: Sqlite.Database, opts: InputBatchGetTags) {
  let tags: TagFromDb[] = [];
  const stmt1 = db.prepare('select id,name,count from tag where id=? and userId=?');
  const userId = opts.userId;
  const ids = opts.ids;
  db.transaction(() => {
    tags = ids.map((id) => stmt1.get([id, userId]) as TagFromDb);
  })();
  return tags;
}

export function updateTagById(db: Sqlite.Database, input: InputUpdateTag) {
  const stmt = db.prepare('UPDATE tag SET name = ? where id = ? AND userId = ?');
  return stmt.run([input.name, input.id, input.userId]);
}

export function deleteTagsByUserId(db: Sqlite.Database, input: { userId: number }) {
  const stmt = db.prepare('DELETE FROM tag where userId = ?');
  return stmt.run([input.userId]);
}

export function deleteTagById(db: Sqlite.Database, input: InputDeleteTag) {
  const stmt = db.prepare('DELETE FROM tag where id = ? AND userId = ?');
  return stmt.run([input.id, input.userId]);
}

export function createTag(db: Sqlite.Database, opts: InputCreateTag) {
  const stmt = db.prepare(TagQueryInsertV0);
  try {
    const ret = stmt.run(opts);
    return { id: ret.lastInsertRowid as number };
  } catch (e) {
    if (e instanceof Sqlite.SqliteError && e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      throw new DataError(DataErrorCode.TagAlreadyExits);
    } else {
      logger.error({ error: e });
      throw e;
    }
  }
}

export function upsertTag(db: Sqlite.Database, input: InputCreateTag) {
  try {
    return createTag(db, input);
  } catch (e) {
    if (e instanceof DataError && e.code === DataErrorCode.TagAlreadyExits) {
      return getTagByName(db, { name: input.name, userId: input.userId });
    }
    throw e;
  }
}

export function batchUpsertTag(db: Sqlite.Database, input: InputBatchUpsertTag) {
  const stmt = db.prepare(TagQueryInsertV1);
  const { userId, items } = input;
  const result: Array<number | InputBatchUpsertTagItem> = [];
  const transact = db.transaction(() => {
    for (const item of items) {
      if (!item.name) {
        result.push(item);
        continue;
      }
      const params = [item.name, userId];
      try {
        const ret = stmt.run(params);
        result.push(ret.lastInsertRowid as number);
      } catch (e) {
        if (e instanceof Sqlite.SqliteError && e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
          const t = getTagByName(db, { name: item.name, userId });
          result.push(t.id);
        } else {
          // may log here too
          result.push(item);
        }
      }
    }
  });
  transact();
  return { result };
}

export function deleteBookmarkTag(db: Sqlite.Database, opts: InputDeleteBookmarkTag, stmt0?: Sqlite.Statement) {
  const stmt = stmt0 ?? db.prepare(BookmarkTagQueryDeleteV0);
  try {
    stmt.run(opts);
  } catch (e) {
    logger.error({ error: e });
    throw e;
  }
}
