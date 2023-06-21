/**
 * try to use the experimental structural sqlite builder
 */
import assert from 'assert';
import type Sqlite from 'better-sqlite3';

import { PAGE_BOOKMARK_LIMIT } from '$lib/env';
import type { InputFindBookmarksOfUser, InputGetRandomBookmarksOfUser } from '$lib/type';

import { Eq, Is, Lte, OrderByDir, select_from } from './builder2';
import { Column, Table } from './identifier';

function paramKey() {
  let i = 0;
  return () => {
    const key = 'p' + i++;
    return { key, placeholder: '@' + key };
  };
}

export function getBookmarks(db: Sqlite.Database, input: InputFindBookmarksOfUser & { counting?: boolean }) {
  const { user, groupId, tagIds, text, counting, after, page } = input;
  assert(user && user.userId);
  const userId = user.userId;

  const Bookmark = Column.Bookmark;
  const builder = select_from(
    Table.Bookmark,
    counting
      ? { name: 'count(*) as count' }
      : [
          Bookmark.Id,
          Bookmark.Title,
          Bookmark.Desc,
          Bookmark.Url,
          Bookmark.GroupId,
          Bookmark.UpdatedAt,
          Bookmark.CreatedAt,
        ],
  ).where(Eq(Bookmark.UserId, '@userId'));

  if (!counting) {
    builder.limit(PAGE_BOOKMARK_LIMIT);
  }

  const params: Record<string, any> = { userId };

  if (typeof groupId === 'number') {
    if (groupId === 0) {
      builder.where(Is(Bookmark.GroupId, '@groupId'));
      params.groupId = null;
    } else {
      builder.where(Eq(Bookmark.GroupId, '@groupId'));
      params.groupId = groupId;
    }
  }

  if (text) {
    builder
      .join(Bookmark.Id, Column.BookmarkFts.RowId)
      .where(Eq(Column.BookmarkFts.Fts, '@text'))
      .orderBy(Column.BookmarkFts.Rank);
    params[text] = text;
  } else {
    builder.orderBy(Bookmark.UpdatedAt, OrderByDir.Descending).orderBy(Bookmark.Id, OrderByDir.Descending);
  }

  const getKey = paramKey();

  if (tagIds && Array.isArray(tagIds)) {
    const bookmarkTagTable = Table.BookmarkTag;
    const bookmarkTagColumn = Column.BookmarkTag.BookmarkId;
    tagIds.forEach((tagId) => {
      const key = getKey();
      const column = { ...bookmarkTagColumn };
      // XXX make column.table a new object
      // so our builder can make a new alias for it
      column.table = { ...bookmarkTagTable };
      builder.join(Bookmark.Id, column);
      builder.where(Eq(column, key.placeholder));
      params[key.key] = tagId;
    });
  }

  // ignore all pagination stuff (page, after) when counting
  if (!counting) {
    if (after && after.id) {
      const p0 = getKey();
      const p1 = getKey();
      builder.where(Lte([Bookmark.UpdatedAt, Bookmark.Id], [p0.placeholder, p1.placeholder])).offset(1);
      params[p0.key] = after.updatedAt;
      params[p1.key] = after.id;
    } else if (page && page > 1) {
      builder.offset(PAGE_BOOKMARK_LIMIT * (page - 1));
    }
  }

  const querystring = builder.build();
  return db.prepare(querystring).all(params);
}

export function getRandomBookmarksOfUser(db: Sqlite.Database, input: InputGetRandomBookmarksOfUser) {
  const { user, take } = input;
  assert(user && user.userId);

  const Bookmark = Column.Bookmark;
  const builder = select_from(Table.Bookmark, [
    Bookmark.Id,
    Bookmark.Title,
    Bookmark.Desc,
    Bookmark.Url,
    Bookmark.GroupId,
    Bookmark.UpdatedAt,
    Bookmark.CreatedAt,
  ])
    .orderBy('RANDOM()')
    .limit(take)
    .where(Eq(Bookmark.UserId, '?'));
  const params = [user.userId];
  const querystring = builder.build();
  return db.prepare(querystring).all(params);
}
