import { PAGE_BOOKMARK_LIMIT } from '$lib/env';
import * as bookmarkDb from '$lib/server/db/bookmark.db';
import * as tagDb from '$lib/server/db/tag.db';
import type {
  BookmarkFromDb,
  InputBatchUpsertBookmark,
  InputCreateBookmark,
  InputDeleteBookmark,
  InputFindBookmarksOfUser,
  InputGetBookmark,
  InputGetBookmarkWithUrl,
  InputGetRandomBookmarksOfUser,
  InputGroupMultiBookmarks,
  InputRestoreMultiBookmarks,
  InputStashMultiBookmarks,
  InputUpdateBookmark,
} from '$lib/type';

import { ApiError, HttpStatus } from '../api.error';
import { DataError, DataErrorCode, lite } from '../db/common.db';
import { logger } from '../logger';
import { UserFeatureFlag } from './user.service';

const TRACKING_QUERYS = ['utm_campaign', 'utm_medium', 'utm_source', 'utm_content', 'utm_id'];

function fixUrl(url: string, feature = 0) {
  const url0 = url || '';
  if ((feature & UserFeatureFlag.FF_STRIP_TRACKING_PARAMETERS) > 0) {
    let u: URL;
    try {
      u = new URL(url0);
    } catch (e) {
      // ingnore
    }
    if (!u) return url0;
    const search = u.searchParams;
    for (const key of TRACKING_QUERYS) {
      if (search.has(key)) search.delete(key);
    }
    return u.toString();
  }
  return url0;
}

export const bookmark = {
  createBookmark: (input: InputCreateBookmark) => {
    const db = lite();
    const { title, desc, user, tags, group } = input;
    const url = fixUrl(input.url, user.feature);
    const input1 = {
      user,
      url,
      title: title || '',
      desc: desc || '',
      tags: tags || [],
      group,
    };

    // confliction error already handled
    const bookmark = bookmarkDb.createBookmark(db, input1);
    bookmark.tagIds = bookmarkDb.getBookmarkTagIds(db, { bookmarkId: bookmark.id });
    return bookmark;
  },
  groupBookmarks: (input: InputGroupMultiBookmarks) => {
    const db = lite();
    const data = bookmarkDb.groupBookmarks(db, input);
    return { data };
  },
  stashBookmarks: (input: InputStashMultiBookmarks) => {
    const db = lite();
    try {
      bookmarkDb.stashBookmarks(db, input);
      return { data: { key: input.key } };
    } catch (e) {
      if (e instanceof DataError && e.code === DataErrorCode.BookmarkNotFound) throw new ApiError(HttpStatus.NOT_FOUND);
      throw e;
    }
  },
  restoreBookmarks: (input: InputRestoreMultiBookmarks) => {
    const db = lite();
    try {
      bookmarkDb.restoreBookmarks(db, input);
      return { data: { key: input.key } };
    } catch (e) {
      if (e instanceof DataError && e.code === DataErrorCode.BookmarkNotFound) throw new ApiError(HttpStatus.NOT_FOUND);
      throw e;
    }
  },
  batchUpsertBookmark: (input: InputBatchUpsertBookmark) => {
    const db = lite();
    return bookmarkDb.batchUpsertBookmark(db, input);
  },

  findBookmarks: (input: InputFindBookmarksOfUser) => {
    const data: { items: BookmarkFromDb[]; count?: number; totalPage?: number } = { items: [] };
    const db = lite();
    const bookmarks = bookmarkDb.getBookmarks(db, input) as BookmarkFromDb[];
    data.items = tagDb.hydrateBookmarks(db, bookmarks);

    let countRet: { count: number };
    if (('text' in input && input.text) || 'tagIds' in input || 'groupId' in input) {
      countRet = bookmarkDb.getBookmarks(db, { ...input, counting: true }) as { count: number };
    } else {
      try {
        countRet = bookmarkDb.getBookmarkCountOfUser(db, input);
      } catch (e) {
        if (e instanceof DataError && e.code === DataErrorCode.UserNotFound) throw new ApiError(HttpStatus.NOT_FOUND);
        throw e;
      }
    }
    data.count = countRet.count || data.items.length;
    data.totalPage = Math.ceil(data.count / PAGE_BOOKMARK_LIMIT);
    return { data };
  },

  getRandomBookmarks: (input: InputGetRandomBookmarksOfUser) => {
    const data: { items: BookmarkFromDb[]; count?: number; totalPage?: number } = { items: [] };
    const db = lite();
    const bookmarks = bookmarkDb.getRandomBookmarksOfUser(db, input) as BookmarkFromDb[];
    data.items = tagDb.hydrateBookmarks(db, bookmarks);
    data.count = input.take;
    data.totalPage = 1;
    return { data };
  },

  updateBookmark: (opts: InputUpdateBookmark) => {
    const db = lite();
    const updates: string[] = [];

    logger.info('updateBookmark %o', opts);
    if (!opts.id) throw new ApiError(400);

    const { tags, id, user, group, ...updateProps } = opts;
    const bookmarkId = id;

    const params: any[] = [];

    for (const field in updateProps) {
      if (!updateProps[field]) continue;
      updates.push(`${field}=?`);
      params.push(updateProps[field]);
    }
    if (group && group.id) {
      updates.push('groupId=?');
      params.push(group.id);
    } else if (group === null) {
      updates.push('groupId=NULL');
    }
    updates.push("updatedAt = strftime('%s', 'now')");
    const updateStr = updates.join(',');
    const stmt = db.prepare(`update bookmark set ${updateStr} where id = ? and userId = ? returning *`);
    params.push(id, user.userId);
    let bookmark: BookmarkFromDb;
    try {
      bookmark = stmt.get(params) as BookmarkFromDb;
      if (!bookmark) throw new ApiError(HttpStatus.NOT_FOUND);
    } catch (e) {
      logger.error({ error: e });
      throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR);
    }
    if (typeof tags !== 'undefined' && Array.isArray(tags)) {
      // even if tags is empty we still should run this
      bookmarkDb.updateBookmarkTags(db, { bookmarkId, userId: user.userId, tags });
    }
    bookmark.tagIds = bookmarkDb.getBookmarkTagIds(db, { bookmarkId: bookmark.id });
    return bookmark;
  },

  getBookmark: (opts: InputGetBookmark) => {
    const { id, user } = opts;
    const db = lite();
    const bookmark = bookmarkDb.getBookmark(db, { id, userId: user.userId }) as BookmarkFromDb;
    if (!bookmark) throw new ApiError(HttpStatus.NOT_FOUND);
    const tagIds = bookmarkDb.getBookmarkTagIds(db, { bookmarkId: id });
    bookmark.tagIds = tagIds;
    return bookmark;
  },

  deleteBookmark: (input: InputDeleteBookmark) => {
    const db = lite();
    return bookmarkDb.deleteBookmark(db, input);
  },

  getBookmarkWithUrl: (input: InputGetBookmarkWithUrl) => {
    const db = lite();
    return bookmarkDb.getBookmarkWithUrl(db, input);
  },
};
