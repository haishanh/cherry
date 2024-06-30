import { test, expect } from 'vitest';

import { buildSelect } from './builder';

test('01', () => {
  const ret = buildSelect({
    tokens: {
      select: 'id,title',
      from: 'bookmark b',
      where: 'b.userId = ?',
    },
    params: [1],
  });
  expect(ret.query.split('\n')).toEqual(['SELECT id,title', 'FROM bookmark b', 'WHERE b.userId = ?']);
  expect(ret.params).toEqual([1]);
});

test('with limit offset', () => {
  const ret = buildSelect({
    tokens: {
      select: 'id,title',
      from: 'bookmark b',
      where: 'b.userId = ?',
      offset: 100,
      limit: 20,
    },
    params: [1],
  });
  expect(ret.query.split('\n')).toEqual([
    'SELECT id,title',
    'FROM bookmark b',
    'WHERE b.userId = ?',
    'LIMIT 20',
    'OFFSET 100',
  ]);
  expect(ret.params).toEqual([1]);
});

test('with as', () => {
  const ret = buildSelect({
    tokens: {
      with: {
        table: 'original',
        as: {
          tokens: {
            select: 'id,title',
            from: 'bookmark b',
            where: 'b.userId = ?',
          },
          params: [1],
        },
      },
      select: 'original.*',
      from: 'original',
      join: 'bookmark_fts on original.id = bookmark_fts.rowid',
      where: 'bookmark_fts match ?',
      orderBy: 'bookmark_fts.rank',
    },
    params: ['react'],
  });
  expect(ret.query.split('\n')).toEqual([
    'WITH original AS (SELECT id,title',
    '  FROM bookmark b',
    '  WHERE b.userId = ?)',
    'SELECT original.*',
    'FROM original',
    'JOIN bookmark_fts on original.id = bookmark_fts.rowid',
    'WHERE bookmark_fts match ?',
    'ORDER BY bookmark_fts.rank',
  ]);
  expect(ret.params).toEqual([1, 'react']);
});

test('with as and multiple joins', () => {
  const ret = buildSelect({
    tokens: {
      with: {
        table: 'original',
        as: {
          tokens: {
            select: 'id,title',
            from: 'bookmark b',
            join: ['bookmark_tag t0 on (t0.bookmarkId = b.id)', 'bookmark_tag t1 on (t1.bookmarkId = b.id)'],
            where: ['b.userId = ?', 't0.tagId = ?', 't1.tagId = ?'],
          },
          params: [1, 2, 3],
        },
      },
      select: 'original.*',
      from: 'original',
      join: 'bookmark_fts on original.id = bookmark_fts.rowid',
      where: 'bookmark_fts match ?',
      orderBy: 'bookmark_fts.rank',
    },
    params: ['react'],
  });
  expect(ret.query.split('\n')).toEqual([
    'WITH original AS (SELECT id,title',
    '  FROM bookmark b',
    '  JOIN bookmark_tag t0 on (t0.bookmarkId = b.id)',
    '  JOIN bookmark_tag t1 on (t1.bookmarkId = b.id)',
    '  WHERE b.userId = ? AND t0.tagId = ? AND t1.tagId = ?)',
    'SELECT original.*',
    'FROM original',
    'JOIN bookmark_fts on original.id = bookmark_fts.rowid',
    'WHERE bookmark_fts match ?',
    'ORDER BY bookmark_fts.rank',
  ]);
  expect(ret.params).toEqual([1, 2, 3, 'react']);
});
