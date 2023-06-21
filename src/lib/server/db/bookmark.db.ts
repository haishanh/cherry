import assert from 'assert';
import type Sqlite from 'better-sqlite3';

import { PAGE_BOOKMARK_LIMIT } from '$lib/env';
import type {
  BookmarkFromDb,
  BookmarkTagFromDb,
  InputBatchUpsertBookmark,
  InputBatchUpsertBookmarkItem,
  InputCreateBookmark,
  InputCreateBookmarkTag,
  InputDeleteBookmark,
  InputDeleteBookmarkTag,
  InputFindBookmarksOfUser,
  InputGetBookmarkCountOfUser,
  InputGetBookmarkWithUrl,
  InputGetRandomBookmarksOfUser,
  InputGroupMultiBookmarks,
  InputRestoreMultiBookmarks,
  InputStashMultiBookmarks,
  NewTagType,
} from '$lib/type';
import { breakupList } from '$lib/utils/common.util';

import { logger } from '../logger';
import { buildSelect } from './builder';
import { DataError, DataErrorCode, isConflict } from './common.db';
import { BookmarkTagQueryDeleteV0 } from './querystring';
import * as tagDb from './tag.db';

const BookmarkQuerySelectV0 = `select id,title,desc,url,groupId,updatedAt,createdAt from bookmark where id = @id and userId = @userId`;
const BookmarkQueryInsertV0 = [
  `insert into bookmark (title,desc,url,userId,groupId,createdAt,updatedAt)`,
  `values (?, ?, ?, ?, ?, strftime('%s','now'), strftime('%s','now')) returning *`,
].join(' ');
const BookmarkQueryInsertV1 = [
  `insert into bookmark (title,desc,url,userId,groupId,createdAt,updatedAt)`,
  `values (?, ?, ?, ?, ?, ?, strftime('%s','now'))`,
].join(' ');
const BOOKMARK_PROPS0 = 'id,title,desc,url,groupId,updatedAt,createdAt';
const BOOKMARK_PROPS1 = 'b.id,b.title,b.desc,b.url,b.groupId,b.updatedAt,b.createdAt';

export function getBookmarks(
  db: Sqlite.Database,
  input: InputFindBookmarksOfUser & {
    // is counting
    counting?: boolean;
  },
) {
  const { user, groupId, tagIds, text, counting, after, page } = input;
  assert(user && user.userId);
  const userId = user.userId;

  const select = counting ? 'count(b.id) as count' : BOOKMARK_PROPS1;
  const from = 'bookmark b';
  const where = ['b.userId = ?'];
  const join = [];

  const tokens: Parameters<typeof buildSelect>[0]['tokens'] = { select, from, where, join };
  const params: Parameters<typeof buildSelect>[0]['params'] = [userId];

  if (typeof groupId === 'number') {
    if (groupId === 0) {
      where.push('groupId IS NULL');
    } else {
      where.push('groupId = ?');
      params.push(groupId);
    }
  }

  if (tagIds && Array.isArray(tagIds)) {
    tagIds.forEach((_, idx) => join.push(`bookmark_tag t${idx} on (t${idx}.bookmarkId = b.id)`));
    for (let i = 0; i < tagIds.length; i++) {
      where.push(`t${i}.tagId = ?`);
      params.push(tagIds[i]);
    }
  }

  if (text) {
    join.push('bookmark_fts on (bookmark_fts.rowid = b.id)');
    where.push('bookmark_fts match ?');
    params.push(text);

    tokens.orderBy = 'bookmark_fts.rank';
  } else {
    tokens.orderBy = 'b.updatedAt desc, b.id desc';
  }

  // ignore pagination stuff (after and page) when counting
  if (!counting) {
    tokens.limit = PAGE_BOOKMARK_LIMIT;
    if (after) {
      const { updatedAt, id } = after;
      where.push('(b.updatedAt, b.id) <= (?, ?)');
      params.push(updatedAt, id);
      tokens.offset = 1;
    } else if (page && page > 1) {
      tokens.offset = (page - 1) * PAGE_BOOKMARK_LIMIT;
    }
  }

  const ret = buildSelect({ tokens, params });
  const stmt = db.prepare(ret.query);
  if (counting) {
    return stmt.get(ret.params);
  } else {
    return stmt.all(ret.params);
  }
}

export function getRandomBookmarksOfUser(db: Sqlite.Database, input: InputGetRandomBookmarksOfUser) {
  const { user, take } = input;
  assert(user && user.userId);
  const select = BOOKMARK_PROPS1;
  const from = 'bookmark b';
  const orderBy = 'RANDOM()';
  const limit = take;
  const where = 'b.userId = ?';
  const tokens: Parameters<typeof buildSelect>[0]['tokens'] = { select, from, where, orderBy, limit };
  const params: Parameters<typeof buildSelect>[0]['params'] = [user.userId];
  const ret = buildSelect({ tokens, params });
  return db.prepare(ret.query).all(ret.params);
}

export function getBookmarkCountOfUser(db: Sqlite.Database, input: InputGetBookmarkCountOfUser) {
  const { user } = input;
  assert(user && user.userId);
  const userId = user.userId;

  const count = db.prepare('select bookmarkCount bookmarkCountSyncedAt from user where id = ?').get([userId]);
  // count could be undefined here
  // to produce, switch to a new db with a previous logged-in session
  if (!count) throw new DataError(DataErrorCode.UserNotFound);

  const now = Math.trunc(Date.now() / 1000);
  if (now - count.bookmarkCountSyncedAt < 86400) {
    return { count: count.bookmarkCount };
  }
  const curr = db.prepare('select count(id) as count from bookmark where userId = ?').get([userId]);
  db.prepare(`update user set bookmarkCount = ?, bookmarkCountSyncedAt = strftime('%s','now') where id = ?`).run([
    curr.count,
    userId,
  ]);
  return { count: curr.count };
}

export function groupBookmarks(db: Sqlite.Database, input: InputGroupMultiBookmarks) {
  const user = input.user;
  const groupId = input.groupId;
  const ids = input.ids;
  const userId = user.userId;

  const success: typeof ids = [];
  const failed: typeof ids = [];

  const stmt0 = db.prepare('update bookmark set groupId = ? where id = ? and userId = ?');

  const run = db.transaction(() => {
    for (const id of ids) {
      try {
        stmt0.run([groupId, id, userId]);
        success.push(id);
      } catch (e) {
        logger.error('groupBookmarks error %o', e);
        failed.push(id);
      }
    }
  });
  run();
  return { success, failed };
}

export function stashBookmarks(db: Sqlite.Database, input: InputStashMultiBookmarks) {
  const user = input.user;
  const key = input.key;
  const ids = input.ids;
  const userId = user.userId;
  const idListList = breakupList(ids, 20);

  const stmt0 = db.prepare('select * from bookmark where id = @id and userId = @userId');
  const stmt1 = db.prepare(tagDb.BookmarkTagQuerySelectV0);
  const stmt2 = db.prepare(
    `insert into bookmark_stash (key, userId, data, createdAt) values (?, ?, ?, strftime('%s','now'))`,
  );
  const stmt3 = db.prepare('delete from bookmark where id = @id and userId = @userId');

  const run = db.transaction(() => {
    for (const idList of idListList) {
      const data = [];
      for (const id of idList) {
        const bookmark = stmt0.get({ id, userId });
        if (!bookmark) throw new DataError(DataErrorCode.BookmarkNotFound);
        const bookmark_tag = stmt1.all(id);
        const item = { bookmark, bookmark_tag };
        data.push(item);
      }
      stmt2.run([key, userId, JSON.stringify(data)]);
      for (const id of idList) {
        const ret = stmt3.run({ id, userId });
        if (ret.changes !== 1) throw new DataError(DataErrorCode.BookmarkNotFound);
      }
    }
  });
  return run();
}

export function restoreBookmarks(db: Sqlite.Database, input: InputRestoreMultiBookmarks) {
  const user = input.user;
  const key = input.key;
  const userId = user.userId;

  const stmt0 = db.prepare('select data from bookmark_stash where key = ? and userId = ?');
  const stmt1 = db.prepare(
    `insert into bookmark (id, title, desc, url, userId, createdAt, updatedAt)
     values (@id, @title, @desc, @url, @userId, @createdAt, @updatedAt) RETURNING id`,
  );
  const stmt2 = db.prepare('delete from bookmark_stash where key = ? and userId = ?');

  const run = db.transaction(() => {
    // XXX probably should consider pagination here to vaoid pulling too much data
    const ret0 = stmt0.all([key, userId]);
    if (!ret0) throw new DataError(DataErrorCode.BookmarkNotFound);
    ret0.forEach((batch) => {
      const list: { bookmark: BookmarkFromDb; bookmark_tag: BookmarkTagFromDb[] }[] = JSON.parse(batch.data);
      list.forEach((item) => {
        const { bookmark, bookmark_tag } = item;
        const ret1 = stmt1.get(bookmark);
        const bookmarkId = ret1.id;
        bookmark_tag.forEach((bt: InputCreateBookmarkTag) => {
          tagDb.createBookmarkTag(db, { ...bt, bookmarkId });
        });
      });
    });
    stmt2.run([key, userId]);
  });
  return run();
}

export function deleteBookmarksByUserId(db: Sqlite.Database, input: { userId: number }) {
  const stmt = db.prepare('delete from bookmark where userId = ?');
  return stmt.run([input.userId]);
}

/// service

export function deleteBookmark(db: Sqlite.Database, input: InputDeleteBookmark) {
  const stmt = db.prepare(`delete from bookmark where id = ? and userId = ?`);
  const { id, user } = input;
  return stmt.run([id, user.userId]);
}

export function getBookmarkWithUrl(db: Sqlite.Database, input: InputGetBookmarkWithUrl) {
  const stmt = db.prepare(`select ${BOOKMARK_PROPS0} from bookmark where url = ? and userId = ?`);
  return stmt.get([input.url, input.userId]);
}

export function getBookmarkTagIds(db: Sqlite.Database, opts: { bookmarkId: number }): number[] {
  const stmt0 = db.prepare('select tagId from bookmark_tag where bookmarkId = ?');
  return stmt0.pluck().all(opts.bookmarkId);
}

export function getAllBookmarkTags(db: Sqlite.Database, opts: { bookmarkId: number }) {
  const stmt0 = db.prepare('select bookmarkId,tagId from bookmark_tag where bookmarkId = ?');
  const bindings = stmt0.all(opts.bookmarkId);
  const stmt1 = db.prepare('select id,name from tag where id = ?');
  const tags = bindings.map((b) => stmt1.get(b.tagId));
  return { bindings, tags };
}

export function updateBookmarkTags(
  db: Sqlite.Database,
  opts: { bookmarkId: number; userId: number; tags: NewTagType[]; isNewBookmark?: boolean },
) {
  const { bookmarkId, userId, tags } = opts;
  const transact = db.transaction(() => {
    // XXX maybe select rowid here too, so we can delete use rowid instead
    const ret = opts.isNewBookmark ? { bindings: [], tags: [] } : getAllBookmarkTags(db, { bookmarkId });
    const bookmarkTagBindings = ret.bindings;
    const existingBookmarkTags = ret.tags;

    const present = new Map<string, { bookmarkId: number; tagId: string }>();
    for (let i = 0; i < existingBookmarkTags.length; i++) {
      const tag = existingBookmarkTags[i];
      const binding = bookmarkTagBindings[i];
      present.set(tag.name, binding);
    }

    const creates: typeof tags = [];
    for (const t of tags) {
      if (!present.get(t.name)) creates.push(t);
      present.delete(t.name);
    }

    // array of bookmark_tag id to be deleted
    const deletes: InputDeleteBookmarkTag[] = [];
    for (const [_, t] of present) {
      deletes.push(t);
    }

    const deleteBookmarkTagStmt = db.prepare(BookmarkTagQueryDeleteV0);
    deletes.forEach((d) => tagDb.deleteBookmarkTag(db, d, deleteBookmarkTagStmt));

    creates.forEach((tag) => {
      let tagId: number;
      try {
        const ret = tagDb.createTag(db, { name: tag.name, userId });
        tagId = ret.id;
      } catch (e) {
        if (e instanceof DataError && e.code === DataErrorCode.TagAlreadyExits) {
          const str = `select id from tag where userId = @userId and name = @name`;
          const ret = db.prepare(str).get({ userId, name: tag.name });
          tagId = ret.id;
        } else {
          throw e;
        }
      }
      tagDb.createBookmarkTag(db, { bookmarkId, tagId });
    });
  });
  transact();
}

export function batchUpsertBookmark(db: Sqlite.Database, input: InputBatchUpsertBookmark) {
  const stmt = db.prepare(BookmarkQueryInsertV1);
  const { userId, items } = input;
  const result: Array<number | InputBatchUpsertBookmarkItem> = [];
  const now = Math.trunc(Date.now() / 1000);
  const transact = db.transaction(() => {
    for (const item of items) {
      if (!item.url) {
        result.push(item);
        continue;
      }
      const params = [item.title || '', item.desc || '', item.url, userId, item.groupId || null, item.createdAt || now];
      try {
        const ret = stmt.run(params);
        result.push(ret.lastInsertRowid as number);
      } catch (e) {
        if (isConflict(e)) {
          const ret = getBookmarkWithUrl(db, { userId, url: item.url });
          result.push(ret.id);
        } else {
          result.push(item);
        }
      }
    }
  });
  transact();
  return { result };
}

export function createBookmark(db: Sqlite.Database, input: InputCreateBookmark) {
  const { tags, group, user, url } = input;
  const userId = user.userId;
  const stmt = db.prepare(BookmarkQueryInsertV0);
  let isNewBookmark = true;
  const params = [input.title, input.desc, url, userId, group && group.id ? group.id : null];
  let bookmark: BookmarkFromDb;
  try {
    bookmark = stmt.get(params);
  } catch (e) {
    if (isConflict(e)) {
      bookmark = getBookmarkWithUrl(db, { userId, url });
      isNewBookmark = false;
    } else {
      throw e;
    }
  }
  if (bookmark && tags && tags.length > 0) {
    updateBookmarkTags(db, { bookmarkId: bookmark.id, userId: user.userId, tags, isNewBookmark });
  }
  return bookmark;
}

export function getBookmark(db: Sqlite.Database, input: { id: number; userId: number }) {
  const { id, userId } = input;
  const stmt = db.prepare(BookmarkQuerySelectV0);
  return stmt.get({ id, userId });
}
