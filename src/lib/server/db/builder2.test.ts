import { test } from 'uvu';
import * as assert from 'uvu/assert';

import { Eq, Lte, OrderByDir, select_from } from './builder2';
import { Column, Table } from './identifier';

test('simple', () => {
  const Bookmark = Column.Bookmark;
  const ret = select_from(Table.Bookmark, [Bookmark.Id, Bookmark.Url, Bookmark.Title]).build();
  const expected = 'SELECT t0.id,t0.url,t0.title FROM bookmark t0';
  assert.equal(ret, expected);
});

test('+where', () => {
  const Bookmark = Column.Bookmark;
  const ret = select_from(Table.Bookmark, [Bookmark.Id, Bookmark.Url, Bookmark.Title])
    .where(Eq(Bookmark.Id, '@id'))
    .build();
  const expected = 'SELECT t0.id,t0.url,t0.title FROM bookmark t0 WHERE t0.id = @id';
  assert.equal(ret, expected);
});

test('+where+orderBy', () => {
  const Bookmark = Column.Bookmark;
  const ret = select_from(Table.Bookmark, [Bookmark.Id, Bookmark.Url, Bookmark.Title])
    .where(Eq(Bookmark.Id, '@id'))
    .orderBy(Bookmark.Id, OrderByDir.Descending)
    .build();
  const expected = 'SELECT t0.id,t0.url,t0.title FROM bookmark t0 WHERE t0.id = @id ORDER BY t0.id DESC';
  assert.equal(ret, expected);
});

test('+where+orderBy+join', () => {
  const Bookmark = Column.Bookmark;
  const ret = select_from(Table.Bookmark, [Bookmark.Id, Bookmark.Url, Bookmark.Title])
    .where(Eq(Bookmark.Id, '@id'))
    .orderBy(Bookmark.Id, OrderByDir.Descending)
    .join(Bookmark.Id, Column.BookmarkTag.BookmarkId)
    .build();
  const expected =
    'SELECT t0.id,t0.url,t0.title FROM bookmark t0 JOIN bookmark_tag t1 ON t0.id = t1.bookmarkId WHERE t0.id = @id ORDER BY t0.id DESC';
  assert.equal(ret, expected);
});

test('+where+orderBy+fts', () => {
  const Bookmark = Column.Bookmark;
  const ret = select_from(Table.Bookmark, [Bookmark.Id, Bookmark.Url, Bookmark.Title])
    .where(Eq(Bookmark.Id, '@id'))
    .where(Eq(Column.BookmarkFts.Fts, '@text'))
    .orderBy(Bookmark.Id, OrderByDir.Descending)
    .join(Bookmark.Id, Column.BookmarkTag.BookmarkId)
    .join(Bookmark.Id, Column.BookmarkFts.RowId)
    .build();
  const expected =
    'SELECT t0.id,t0.url,t0.title FROM bookmark t0 JOIN bookmark_tag t1 ON t0.id = t1.bookmarkId JOIN bookmark_fts t2 ON t0.id = t2.rowid WHERE t0.id = @id AND bookmark_fts = @text ORDER BY t0.id DESC';
  assert.equal(ret, expected);
});

test('multi column where', () => {
  const Bookmark = Column.Bookmark;
  const ret = select_from(Table.Bookmark, [Bookmark.Id, Bookmark.Url, Bookmark.Title])
    .where(Lte([Bookmark.UpdatedAt, Bookmark.Id], ['@updatedAt', '@id']))
    .orderBy(Bookmark.UpdatedAt, OrderByDir.Descending)
    .orderBy(Bookmark.Id, OrderByDir.Descending)
    .build();
  const expected =
    'SELECT t0.id,t0.url,t0.title FROM bookmark t0 WHERE (t0.updatedAt,t0.id) <= (@updatedAt,@id) ORDER BY t0.updatedAt DESC,t0.id DESC';
  assert.equal(ret, expected);
});

test.run();
