import { describe, it, expect } from 'vitest';

import { delete_from, Eq, insert_into, Lte, OrderByDir, select_from, update_table, ValueToken } from './builder2';
import { Column, Table } from './identifier';

describe('SelectFrom', () => {
  it('simple', () => {
    const Bookmark = Column.Bookmark;
    const ret = select_from(Table.Bookmark, [Bookmark.Id, Bookmark.Url, Bookmark.Title]).build();
    const expected = 'SELECT t0.id,t0.url,t0.title FROM bookmark t0';
    expect(ret.source).toEqual(expected);
    expect(ret.params).toEqual([]);
  });
  it('+where', () => {
    const Bookmark = Column.Bookmark;
    const ret = select_from(Table.Bookmark, [Bookmark.Id, Bookmark.Url, Bookmark.Title])
      .where(Eq(Bookmark.Id, 3))
      .build();
    const expected = 'SELECT t0.id,t0.url,t0.title FROM bookmark t0 WHERE t0.id = ?';
    expect(ret.source).toEqual(expected);
    expect(ret.params).toEqual([3]);
  });

  it('+where+orderBy', () => {
    const Bookmark = Column.Bookmark;
    const ret = select_from(Table.Bookmark, [Bookmark.Id, Bookmark.Url, Bookmark.Title])
      .where(Eq(Bookmark.Id, 10))
      .orderBy(Bookmark.Id, OrderByDir.Descending)
      .build();
    const expected = 'SELECT t0.id,t0.url,t0.title FROM bookmark t0 WHERE t0.id = ? ORDER BY t0.id DESC';
    expect(ret.source).toEqual(expected);
    expect(ret.params).toEqual([10]);
  });

  it('+where+orderBy+join', () => {
    const Bookmark = Column.Bookmark;
    const ret = select_from(Table.Bookmark, [Bookmark.Id, Bookmark.Url, Bookmark.Title])
      .where(Eq(Bookmark.Id, 9))
      .orderBy(Bookmark.Id, OrderByDir.Descending)
      .join(Bookmark.Id, Column.BookmarkTag.BookmarkId)
      .build();
    const expected =
      'SELECT t0.id,t0.url,t0.title FROM bookmark t0 JOIN bookmark_tag t1 ON t0.id = t1.bookmarkId WHERE t0.id = ? ORDER BY t0.id DESC';
    expect(ret.source).toEqual(expected);
    expect(ret.params).toEqual([9]);
  });

  it('+where+orderBy+fts', () => {
    const Bookmark = Column.Bookmark;
    const ret = select_from(Table.Bookmark, [Bookmark.Id, Bookmark.Url, Bookmark.Title])
      .where(Eq(Bookmark.Id, 3))
      .where(Eq(Column.BookmarkFts.Fts, 'hello world'))
      .orderBy(Bookmark.Id, OrderByDir.Descending)
      .join(Bookmark.Id, Column.BookmarkTag.BookmarkId)
      .join(Bookmark.Id, Column.BookmarkFts.RowId)
      .build();
    const expected =
      'SELECT t0.id,t0.url,t0.title FROM bookmark t0 JOIN bookmark_tag t1 ON t0.id = t1.bookmarkId JOIN bookmark_fts t2 ON t0.id = t2.rowid WHERE t0.id = ? AND bookmark_fts = ? ORDER BY t0.id DESC';
    expect(ret.source).toEqual(expected);
    expect(ret.params).toEqual([3, 'hello world']);
  });

  it('multi column where', () => {
    const Bookmark = Column.Bookmark;
    const ret = select_from(Table.Bookmark, [Bookmark.Id, Bookmark.Url, Bookmark.Title])
      .where(Lte([Bookmark.UpdatedAt, Bookmark.Id], [1234, 5]))
      .orderBy(Bookmark.UpdatedAt, OrderByDir.Descending)
      .orderBy(Bookmark.Id, OrderByDir.Descending)
      .build();
    const expected =
      'SELECT t0.id,t0.url,t0.title FROM bookmark t0 WHERE (t0.updatedAt,t0.id) <= (?,?) ORDER BY t0.updatedAt DESC,t0.id DESC';
    expect(ret.source).toEqual(expected);
    expect(ret.params).toEqual([1234, 5]);
  });
});

describe('InsertInto', () => {
  it('basic', () => {
    const cols = Column.Bookmark;
    const { source, params } = insert_into(Table.Bookmark)
      .column(cols.UserId, 1)
      .column(cols.Title, 'title0')
      .column(cols.Desc, 'desc0')
      .column(cols.Url, 'https://example.com')
      .build();
    expect(source).toEqual('insert into bookmark (userId,title,desc,url) values (?,?,?,?) returning *');
    expect(params).toEqual([1, 'title0', 'desc0', 'https://example.com']);
  });

  it('strftime now', () => {
    const cols = Column.Bookmark;
    const { source, params } = insert_into(Table.Bookmark)
      .column(cols.UserId, 1)
      .column(cols.Title, 'title0')
      .column(cols.CreatedAt, ValueToken.Now)
      .column(cols.Desc, 'desc0')
      .column(cols.Url, 'https://example.com')
      .build();
    expect(source).toEqual(
      "insert into bookmark (userId,title,createdAt,desc,url) values (?,?,strftime('%s','now'),?,?) returning *",
    );
    expect(params).toEqual([1, 'title0', 'desc0', 'https://example.com']);
  });
});

describe('UpdateTable', () => {
  it('basic', () => {
    const cols = Column.Bookmark;
    const { source, params } = update_table(Table.Bookmark)
      .column(cols.Title, 'hello world')
      .column(cols.UpdatedAt, ValueToken.Now)
      .build();
    expect(source).toEqual("update bookmark set title = ?, updatedAt = strftime('%s','now')");
    expect(params).toEqual(['hello world']);
  });

  it('with where', () => {
    const cols = Column.Bookmark;
    const { source, params } = update_table(Table.Bookmark)
      .where(Eq(cols.Id, 10))
      .column(cols.Title, 'hello world')
      .column(cols.UpdatedAt, ValueToken.Now)
      .build();
    expect(source).toEqual("update bookmark set title = ?, updatedAt = strftime('%s','now') WHERE id = ?");
    expect(params).toEqual(['hello world', 10]);
  });
});

describe('DeleteFrom', () => {
  it('basic', () => {
    const cols = Column.Bookmark;
    const { source, params } = delete_from(Table.Bookmark).where(Eq(cols.Id, 10)).build();
    expect(source).toEqual('delete from bookmark WHERE id = ?');
    expect(params).toEqual([10]);
  });
});
