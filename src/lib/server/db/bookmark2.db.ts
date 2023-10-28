/**
 * try to use the experimental structural sqlite builder
 */
import assert from 'assert';
import type Sqlite from 'better-sqlite3';

import { PAGE_BOOKMARK_LIMIT } from '$lib/env';
import type { InputFindBookmarksOfUser, InputGetRandomBookmarksOfUser } from '$lib/type';

import { Eq, Is, Lte, Match, OrderByDir, select_from } from './builder2';
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

  const limit = input.limit || PAGE_BOOKMARK_LIMIT;

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
  ).where(Eq(Bookmark.UserId, userId));

  if (!counting) {
    builder.limit(limit);
  }

  if (typeof groupId === 'number') {
    if (groupId === 0) {
      builder.where(Is(Bookmark.GroupId, null));
    } else {
      builder.where(Eq(Bookmark.GroupId, groupId));
    }
  }

  // const getKey = paramKey();

  if (tagIds && Array.isArray(tagIds)) {
    const bookmarkTagTable = Table.BookmarkTag;
    tagIds.forEach((tagId) => {
      // XXX make table a new object
      // so our builder can make a new alias for it
      const table = { ...bookmarkTagTable };
      const column = {
        BookmarkId: { name: 'bookmarkId', table },
        TagId: { name: 'tagId', table },
      };
      builder.join(Bookmark.Id, column.BookmarkId);
      builder.where(Eq(column.TagId, tagId));
    });
  }

  // ignore all pagination stuff (page, after) when counting
  if (!counting) {
    if (after && after.id && after.updatedAt) {
      builder.where(Lte([Bookmark.UpdatedAt, Bookmark.Id], [after.updatedAt, after.id])).offset(1);
    } else if (page && page > 1) {
      builder.offset(limit * (page - 1));
    }
  }

  if (text) {
    builder
      .join(Bookmark.Id, Column.BookmarkFts.RowId)
      .where(Match(Column.BookmarkFts.Fts, text))
      .orderBy(Column.BookmarkFts.Rank);
  } else {
    builder.orderBy(Bookmark.UpdatedAt, OrderByDir.Descending).orderBy(Bookmark.Id, OrderByDir.Descending);
  }

  const ret = builder.build();
  return db.prepare(ret.source).all(ret.params);
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
    .where(Eq(Bookmark.UserId, user.userId));
  const ret = builder.build();
  return db.prepare(ret.source).all(ret.params);
}
