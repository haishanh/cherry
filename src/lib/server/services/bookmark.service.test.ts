import { randomUUID } from 'node:crypto';
import * as fs from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import type Sqlite from 'better-sqlite3';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError, HttpStatus } from '../api.error';
import * as bookmarkDb from '../db/bookmark.db';
import { lite } from '../db/common.db';
import { bookmark } from './bookmark.service';

vi.mock('../db/common.db', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../db/common.db')>();
  return { ...actual, lite: vi.fn(actual.lite) };
});

describe('bookmark.updateBookmark', () => {
  let db: Sqlite.Database;
  let dbFile: string;
  let id: number;
  const user = { userId: 1, feature: 0 };

  beforeEach(async () => {
    const actual = await vi.importActual<typeof import('../db/common.db')>('../db/common.db');
    dbFile = path.join(tmpdir(), `cherry-bookmark-${randomUUID()}.sqlite`);
    db = actual.lite(dbFile);
    vi.mocked(lite).mockReturnValue(db);
    const initial = bookmark.createBookmark({
      user,
      url: 'https://example.com',
      title: 'Original title',
      desc: 'Original description',
      tags: [{ name: 'original' }],
    });
    id = initial.id;
    db.prepare('update bookmark set updatedAt = 1 where id = ?').run(id);
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    db.close();
    await Promise.all([dbFile, `${dbFile}-wal`, `${dbFile}-shm`].map((file) => fs.rm(file, { force: true })));
  });

  it('allows clearing title and description without changing omitted fields or tags', () => {
    const result = bookmark.updateBookmark({ id, user, title: '', desc: '', url: undefined });
    expect(result).toMatchObject({ id, title: '', desc: '', url: 'https://example.com' });
    expect(result.updatedAt).toBeGreaterThan(1);
    expect(result.tagIds).toHaveLength(1);
    expect(result).toMatchObject(bookmark.getBookmark({ id, user }));
  });

  it('supports tag-only edits and clearing all tags', () => {
    const result = bookmark.updateBookmark({ id, user, tags: [] });
    expect(result).toMatchObject({ title: 'Original title', desc: 'Original description', tagIds: [] });
    expect(bookmark.getBookmark({ id, user }).tagIds).toEqual([]);
  });

  it('commits bookmark and tag edits together', () => {
    const result = bookmark.updateBookmark({ id, user, title: 'Updated', tags: [{ id: 0, name: 'replacement' }] });
    expect(result.title).toBe('Updated');
    expect(bookmarkDb.getAllBookmarkTags(db, { bookmarkId: id }).tags.map((tag) => tag.name)).toEqual(['replacement']);
    expect(result).toMatchObject(bookmark.getBookmark({ id, user }));
  });

  it('returns 404 for a missing bookmark', () => {
    expect(() => bookmark.updateBookmark({ id: id + 1, user, title: 'Updated' })).toThrow(
      expect.objectContaining({ status: HttpStatus.NOT_FOUND }),
    );
  });

  it('returns 404 for another user’s bookmark without modifying it', () => {
    const initial = bookmark.getBookmark({ id, user });
    expect(() => bookmark.updateBookmark({ id, user: { userId: 2, feature: 0 }, title: 'Updated', tags: [] })).toThrow(
      expect.objectContaining({ status: HttpStatus.NOT_FOUND }),
    );
    expect(bookmark.getBookmark({ id, user })).toEqual(initial);
  });

  it('rolls back bookmark, tags, and timestamp when a tag write fails', () => {
    const initial = bookmark.getBookmark({ id, user });
    db.exec(`
      CREATE TRIGGER fail_tag_binding BEFORE INSERT ON bookmark_tag
      BEGIN SELECT RAISE(ABORT, 'tag write failed'); END;
    `);
    expect(() =>
      bookmark.updateBookmark({ id, user, title: 'Updated', tags: [{ id: 0, name: 'replacement' }] }),
    ).toThrow(expect.objectContaining({ status: HttpStatus.INTERNAL_SERVER_ERROR }));
    expect(bookmark.getBookmark({ id, user })).toEqual(initial);
    expect(db.prepare('select name, count from tag').all()).toEqual([{ name: 'original', count: 1 }]);
  });

  it('maps unexpected database errors to 500 without partial changes', () => {
    const initial = bookmark.getBookmark({ id, user });
    db.exec(`
      CREATE TRIGGER fail_bookmark_update BEFORE UPDATE ON bookmark
      BEGIN SELECT RAISE(ABORT, 'bookmark write failed'); END;
    `);
    expect(() => bookmark.updateBookmark({ id, user, title: 'Updated' })).toThrow(
      expect.objectContaining({ status: HttpStatus.INTERNAL_SERVER_ERROR }),
    );
    expect(bookmark.getBookmark({ id, user })).toEqual(initial);
  });

  it('rejects an invalid bookmark id', () => {
    expect(() => bookmark.updateBookmark({ id: 0, user, title: 'Updated' })).toThrow(ApiError);
  });
});
