import { randomUUID } from 'node:crypto';
import * as fs from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import type Sqlite from 'better-sqlite3';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import type { BookmarkFromDb } from '#lib/type.js';

import * as bookmarkDb from './bookmark.db';
import * as bookmarkDb2 from './bookmark2.db';
import { lite } from './common.db';

describe('literal bookmark search', () => {
  let db: Sqlite.Database;
  const dbFile = path.join(tmpdir(), `cherry-search-${randomUUID()}.sqlite`);

  beforeAll(() => {
    db = lite(dbFile);
    const insert = db.prepare(`
      insert into bookmark (id, userId, url, title, desc, createdAt, updatedAt)
      values (?, ?, ?, ?, ?, 1, 1)
    `);
    insert.run(1, 1, 'https://import-qa.example.test/path?x=1&y=2', 'A quoted multiline 标题', 'alpha beta fast tool');
    insert.run(2, 1, 'https://another.example.test', 'Rust guide', 'beta before alpha');
    insert.run(3, 2, 'https://import-qa.example.test/private', 'Private secret', 'alpha beta');
  });
  afterAll(async () => {
    db.close();
    await Promise.all([dbFile, `${dbFile}-wal`, `${dbFile}-shm`].map((file) => fs.rm(file, { force: true })));
  });

  describe.each([
    ['legacy query', bookmarkDb.getBookmarks],
    ['structural query', bookmarkDb2.getBookmarks],
  ] as const)('%s', (_, getBookmarks) => {
    function ids(text: string) {
      return (getBookmarks(db, { user: { userId: 1 }, text }) as BookmarkFromDb[]).map((b) => b.id).sort();
    }

    it.each([
      ['import-qa.example.test', [1]],
      ['"import-qa.example.test"', [1]],
      ['https://import-qa.example.test/path?x=1&y=2', [1]],
      ['alpha beta', [1, 2]],
      ['"alpha beta"', [1]],
      ['quoted fast', [1]],
      ['"quoted fast"', []],
      ['"alpha', [1, 2]],
      ['标题', [1]],
      ['secret', []],
      ['alpha" OR "secret', []],
      ['title:alpha', []],
      ['NEAR(alpha beta)', []],
      ['(', []],
      ['*', []],
      ['"', []],
      ['   ', []],
      ['alpha\0beta', [1, 2]],
    ] as const)('handles %j as text without exposing FTS syntax', (query, expected) => {
      expect(ids(query)).toEqual(expected);
    });

    it('also escapes search text in count queries', () => {
      const result = getBookmarks(db, { user: { userId: 1 }, text: 'import-qa.example.test', counting: true });
      expect(Array.isArray(result) ? result[0] : result).toEqual({ count: 1 });
    });
  });
});
