import { suite } from 'uvu';
import * as assert from 'uvu/assert';

import { delete_from, Eq, insert_into, Lte, OrderByDir, select_from, update_table, ValueToken } from './builder2';
import { Column, Table } from './identifier';

const select = suite('SelectFrom');

select('simple', () => {
  const Bookmark = Column.Bookmark;
  const ret = select_from(Table.Bookmark, [Bookmark.Id, Bookmark.Url, Bookmark.Title]).build();
  const expected = 'SELECT t0.id,t0.url,t0.title FROM bookmark t0';
  assert.equal(ret.source, expected);
  assert.equal(ret.params, []);
});

select('+where', () => {
  const Bookmark = Column.Bookmark;
  const ret = select_from(Table.Bookmark, [Bookmark.Id, Bookmark.Url, Bookmark.Title])
    .where(Eq(Bookmark.Id, 3))
    .build();
  const expected = 'SELECT t0.id,t0.url,t0.title FROM bookmark t0 WHERE t0.id = ?';
  assert.equal(ret.source, expected);
  assert.equal(ret.params, [3]);
});

select('+where+orderBy', () => {
  const Bookmark = Column.Bookmark;
  const ret = select_from(Table.Bookmark, [Bookmark.Id, Bookmark.Url, Bookmark.Title])
    .where(Eq(Bookmark.Id, 10))
    .orderBy(Bookmark.Id, OrderByDir.Descending)
    .build();
  const expected = 'SELECT t0.id,t0.url,t0.title FROM bookmark t0 WHERE t0.id = ? ORDER BY t0.id DESC';
  assert.equal(ret.source, expected);
  assert.equal(ret.params, [10]);
});

select('+where+orderBy+join', () => {
  const Bookmark = Column.Bookmark;
  const ret = select_from(Table.Bookmark, [Bookmark.Id, Bookmark.Url, Bookmark.Title])
    .where(Eq(Bookmark.Id, 9))
    .orderBy(Bookmark.Id, OrderByDir.Descending)
    .join(Bookmark.Id, Column.BookmarkTag.BookmarkId)
    .build();
  const expected =
    'SELECT t0.id,t0.url,t0.title FROM bookmark t0 JOIN bookmark_tag t1 ON t0.id = t1.bookmarkId WHERE t0.id = ? ORDER BY t0.id DESC';
  assert.equal(ret.source, expected);
  assert.equal(ret.params, [9]);
});

select('+where+orderBy+fts', () => {
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
  assert.equal(ret.source, expected);
  assert.equal(ret.params, [3, 'hello world']);
});

select('multi column where', () => {
  const Bookmark = Column.Bookmark;
  const ret = select_from(Table.Bookmark, [Bookmark.Id, Bookmark.Url, Bookmark.Title])
    .where(Lte([Bookmark.UpdatedAt, Bookmark.Id], [1234, 5]))
    .orderBy(Bookmark.UpdatedAt, OrderByDir.Descending)
    .orderBy(Bookmark.Id, OrderByDir.Descending)
    .build();
  const expected =
    'SELECT t0.id,t0.url,t0.title FROM bookmark t0 WHERE (t0.updatedAt,t0.id) <= (?,?) ORDER BY t0.updatedAt DESC,t0.id DESC';
  assert.equal(ret.source, expected);
  assert.equal(ret.params, [1234, 5]);
});

select.run();

const insert = suite('InsertInto');

insert('basic', () => {
  const cols = Column.Bookmark;
  const { source, params } = insert_into(Table.Bookmark)
    .column(cols.UserId, 1)
    .column(cols.Title, 'title0')
    .column(cols.Desc, 'desc0')
    .column(cols.Url, 'https://example.com')
    .build();
  assert.equal(source, 'insert into bookmark (userId,title,desc,url) values (?,?,?,?) returning *');
  assert.equal(params, [1, 'title0', 'desc0', 'https://example.com']);
});

insert('strftime now', () => {
  const cols = Column.Bookmark;
  const { source, params } = insert_into(Table.Bookmark)
    .column(cols.UserId, 1)
    .column(cols.Title, 'title0')
    .column(cols.CreatedAt, ValueToken.Now)
    .column(cols.Desc, 'desc0')
    .column(cols.Url, 'https://example.com')
    .build();
  assert.equal(
    source,
    "insert into bookmark (userId,title,createdAt,desc,url) values (?,?,strftime('%s','now'),?,?) returning *",
  );
  assert.equal(params, [1, 'title0', 'desc0', 'https://example.com']);
});

insert.run();

const update = suite('UpdateTable');

update('basic', () => {
  const cols = Column.Bookmark;
  const { source, params } = update_table(Table.Bookmark)
    .column(cols.Title, 'hello world')
    .column(cols.UpdatedAt, ValueToken.Now)
    .build();
  assert.equal(source, "update bookmark set title = ?, updatedAt = strftime('%s','now')");
  assert.equal(params, ['hello world']);
});

update('with where', () => {
  const cols = Column.Bookmark;
  const { source, params } = update_table(Table.Bookmark)
    .where(Eq(cols.Id, 10))
    .column(cols.Title, 'hello world')
    .column(cols.UpdatedAt, ValueToken.Now)
    .build();
  assert.equal(source, "update bookmark set title = ?, updatedAt = strftime('%s','now') WHERE id = ?");
  assert.equal(params, ['hello world', 10]);
});

update.run();

const test_delete_from = suite('DeleteFrom');

test_delete_from('basic', () => {
  const cols = Column.Bookmark;
  const { source, params } = delete_from(Table.Bookmark)
    .where(Eq(cols.Id, 10))
    .build();
  assert.equal(source, "delete from bookmark WHERE id = ?");
  assert.equal(params, [10]);
});

test_delete_from.run();
