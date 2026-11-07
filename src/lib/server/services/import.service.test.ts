import { randomUUID } from 'node:crypto';
import * as fs from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import type Sqlite from 'better-sqlite3';
import { stringify } from 'csv-stringify/sync';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { IMPORT_MAX_ISSUES, IMPORT_MAX_ROWS, type ImportDuplicates, type ImportSource } from '#lib/import.js';

import { lite } from '../db/common.db';
import { ImportService } from './import.service';

describe('ImportService', () => {
  let db: Sqlite.Database;
  let service: ImportService;
  const dbFile = path.join(tmpdir(), `cherry-import-${randomUUID()}.sqlite`);

  beforeAll(() => {
    db = lite(dbFile);
    service = new ImportService(db);
  });
  beforeEach(() => {
    db.exec(`
      DROP TRIGGER IF EXISTS fail_import;
      DELETE FROM bookmark;
      DELETE FROM tag;
      DELETE FROM cherry_group;
      DELETE FROM user;
      INSERT INTO user (id, username) VALUES (1, 'one'), (2, 'two');
    `);
  });
  afterAll(async () => {
    db.close();
    await Promise.all([dbFile, `${dbFile}-wal`, `${dbFile}-shm`].map((file) => fs.rm(file, { force: true })));
  });

  function run(
    text: string,
    options: { preview?: boolean; duplicates?: ImportDuplicates; userId?: number; source?: ImportSource } = {},
  ) {
    return service.run({ text, source: 'csv', userId: 1, preview: false, duplicates: 'skip', ...options });
  }
  function snapshot() {
    return Object.fromEntries(
      ['bookmark', 'tag', 'cherry_group', 'bookmark_tag', 'user'].map((table) => [
        table,
        db.prepare(`select * from ${table} order by rowid`).all(),
      ]),
    );
  }

  it('previews valid, invalid, and duplicate records without writing anything', () => {
    run('url,title,tags\nhttps://existing.test,Existing,original');
    const before = snapshot();
    const result = run(
      'url,title,folder,tags\nhttps://new.test,New,Folder,new\nhttps://existing.test,Replace,Unused,extra\nhttps://new.test,Duplicate,Unused,ignored\njavascript:alert(1),Bad,Unused,bad',
      { preview: true },
    );
    expect(result).toMatchObject({
      preview: true,
      total: 4,
      imported: 1,
      merged: 0,
      skipped: 2,
      duplicates: 2,
      failed: 1,
      count: 1,
    });
    expect(result.issues[0]).toMatchObject({ row: 5 });
    expect(snapshot()).toEqual(before);
  });

  it('imports valid rows and reports invalid rows without creating orphan groups or tags', () => {
    const result = run('url,title,folder,tags\nhttps://valid.test,Good,Kept,"a, a, ,b"\n/relative,Bad,Unused,bad');
    expect(result).toMatchObject({ total: 2, imported: 1, failed: 1, count: 1 });
    expect(db.prepare('select title from bookmark').all()).toEqual([{ title: 'Good' }]);
    expect(db.prepare('select name from cherry_group').all()).toEqual([{ name: 'Kept' }]);
    expect(db.prepare('select name, count from tag order by name').all()).toEqual([
      { name: 'a', count: 1 },
      { name: 'b', count: 1 },
    ]);
    expect(db.prepare('select bookmarkCount from user where id = 1').get()).toEqual({ bookmarkCount: 1 });
  });

  it('skips duplicates without changing existing metadata, timestamps, or tags', () => {
    const text = 'url,title,folder,tags\nhttps://example.test,Original,Original,original';
    run(text);
    const before = snapshot();
    expect(run('url,title,folder,tags\nhttps://example.test,Replacement,Unused,new')).toMatchObject({
      imported: 0,
      skipped: 1,
      count: 0,
    });
    expect(snapshot()).toEqual(before);
  });

  it('merges tags additively without overwriting metadata or creating unused folders', () => {
    run('url,title,description,folder,tags\nhttps://example.test,Original,Description,Original,original');
    const before = db.prepare('select * from bookmark').get();
    const text = 'url,title,folder,tags\nhttps://example.test,Replacement,Unused,"original,extra"';
    const preview = run(text, { preview: true, duplicates: 'merge-tags' });
    expect(preview).toMatchObject({ imported: 0, merged: 1, duplicates: 1, count: 1 });
    expect(run(text, { duplicates: 'merge-tags' })).toEqual({ ...preview, preview: false });
    expect(db.prepare('select * from bookmark').get()).toEqual(before);
    expect(db.prepare('select name, count from tag order by name').all()).toEqual([
      { name: 'extra', count: 1 },
      { name: 'original', count: 1 },
    ]);
    expect(db.prepare('select name from cherry_group').all()).toEqual([{ name: 'Original' }]);
    const after = snapshot();
    run(text, { duplicates: 'merge-tags' });
    expect(snapshot()).toEqual(after);
  });

  it('keeps the first valid occurrence of a URL within a file', () => {
    const result = run('url,title\nhttps://example.test,First\nhttps://example.test,Second', {
      duplicates: 'merge-tags',
    });
    expect(result).toMatchObject({ imported: 1, skipped: 1, duplicates: 1 });
    expect(db.prepare('select title from bookmark').get()).toEqual({ title: 'First' });
  });

  it('checks duplicates only within the authenticated user’s library', () => {
    run('url,tags\nhttps://example.test,other', { userId: 2 });
    expect(run('url,tags\nhttps://example.test,mine', { duplicates: 'merge-tags' })).toMatchObject({
      imported: 1,
      merged: 0,
    });
    expect(db.prepare('select userId, name from tag order by userId').all()).toEqual([
      { userId: 1, name: 'mine' },
      { userId: 2, name: 'other' },
    ]);
    expect(db.prepare('select count(*) as count from bookmark').get()).toEqual({ count: 2 });
  });

  it('rolls back every row, tag, folder, counter, and FTS change on database failure', () => {
    run('url,tags\nhttps://existing.test,original');
    const before = snapshot();
    db.exec(`CREATE TRIGGER fail_import BEFORE INSERT ON bookmark_tag
      WHEN (SELECT name FROM tag WHERE id = NEW.tagId) = 'fail'
      BEGIN SELECT RAISE(ABORT, 'simulated import failure'); END;`);
    expect(() =>
      run(
        'url,title,folder,tags\nhttps://existing.test,Keep,Unused,extra\nhttps://first.test,UniqueFirst,Folder,ok\nhttps://second.test,Second,Folder,fail',
        { duplicates: 'merge-tags' },
      ),
    ).toThrow(expect.objectContaining({ status: 500, message: expect.stringContaining('No changes were saved') }));
    expect(snapshot()).toEqual(before);
    expect(db.prepare("select rowid from bookmark_fts_v3 where bookmark_fts_v3 match 'UniqueFirst'").all()).toEqual([]);
  });

  it('round-trips CSV export fields including escaped quotes, newlines, BOM, and an empty final column', () => {
    const text =
      '\uFEFF' +
      stringify([
        ['created', 'group', 'tags', 'url', 'title', 'description'],
        [1629980125, 'Folder', 'one,two', 'https://example.test?q=a,b', 'A "quoted"\ntitle', ''],
      ]);
    expect(run(text).imported).toBe(1);
    expect(db.prepare('select url, title, desc, createdAt from bookmark').get()).toEqual({
      url: 'https://example.test?q=a,b',
      title: 'A "quoted"\ntitle',
      desc: '',
      createdAt: 1629980125,
    });
    expect(db.prepare('select name from cherry_group').get()).toEqual({ name: 'Folder' });
  });

  it('accepts group in the first column and ISO dates', () => {
    run('group,url,created\nFolder,https://example.test,2024-01-01T00:00:00Z');
    expect(db.prepare('select createdAt from bookmark').get()).toEqual({ createdAt: 1704067200 });
    expect(db.prepare('select name from cherry_group').get()).toEqual({ name: 'Folder' });
  });

  it('reports malformed records and bad dates, with bounded issue details', () => {
    const text =
      'url,created\n' +
      Array.from({ length: 25 }, (_, i) => `https://example.test/${i},not-a-date`).join('\n') +
      '\nhttps://short.test';
    const result = run(text);
    expect(result.failed).toBe(26);
    expect(result.issues).toHaveLength(IMPORT_MAX_ISSUES);
    expect(db.prepare('select count(*) as count from bookmark').get()).toEqual({ count: 0 });
  });

  it.each([
    '',
    'url\n',
    'title\nHello',
    'url,url\nhttps://a.test,https://b.test',
    'url,title\nhttps://a.test,"unclosed',
  ])('rejects malformed CSV before writing: %j', (text) => {
    const before = snapshot();
    expect(() => run(text)).toThrow(expect.objectContaining({ status: 400 }));
    expect(snapshot()).toEqual(before);
  });

  it('rejects over-limit files, including invalid records, before writing', () => {
    const before = snapshot();
    expect(() => run('url\n' + 'invalid\n'.repeat(IMPORT_MAX_ROWS + 1))).toThrow(
      expect.objectContaining({ status: 400 }),
    );
    expect(snapshot()).toEqual(before);
  });

  it('imports browser folders, entities, nested title markup, tags, and original dates', () => {
    const html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
      <DL><p><DT><H3>Parent &amp; Co</H3><DL><p><DT><H3>Child</H3><DL><p>
      <DT><A HREF="https://example.test?a=1&amp;b=2" ADD_DATE="1629980125" TAGS="a,b">A <b>bold</b> title</A>
      </DL><p></DL><p><DT><A HREF="https://root.test">Root</A></DL>`;
    expect(run(html, { source: 'netscape-bookmark-file-1' }).imported).toBe(2);
    expect(
      db.prepare('select title, url, createdAt from bookmark where url like ?').get('https://example.test%'),
    ).toEqual({ title: 'A bold title', url: 'https://example.test?a=1&b=2', createdAt: 1629980125 });
    expect(db.prepare('select name from cherry_group').all()).toEqual([{ name: 'Parent & Co / Child' }]);
  });

  it('imports Pocket exports and rejects unsafe URLs consistently', () => {
    const html =
      '<html><body><ul><li><a href="https://example.test" time_added="1629980125" tags="a,b">A &amp; B</a></li><li><a href="javascript:alert(1)">Unsafe</a></li></ul></body></html>';
    expect(run(html, { source: 'pocket' })).toMatchObject({ imported: 1, failed: 1, total: 2 });
    expect(db.prepare('select title, createdAt from bookmark').get()).toEqual({
      title: 'A & B',
      createdAt: 1629980125,
    });
  });

  it.each(['pocket', 'netscape-bookmark-file-1'] as const)('rejects wrong or empty HTML exports: %s', (source) => {
    expect(() => run('<html>Not an export</html>', { source })).toThrow(expect.objectContaining({ status: 400 }));
  });

  it('accepts exactly the record limit in a preview', () => {
    expect(run('url\n' + 'https://example.test\n'.repeat(IMPORT_MAX_ROWS), { preview: true })).toMatchObject({
      total: IMPORT_MAX_ROWS,
      imported: 1,
      skipped: IMPORT_MAX_ROWS - 1,
    });
    expect(db.prepare('select count(*) as count from bookmark').get()).toEqual({ count: 0 });
  });

  it.each(['pocket', 'netscape-bookmark-file-1'] as const)('enforces the HTML record limit: %s', (source) => {
    const prefix = source === 'pocket' ? '<html><ul>' : '<!DOCTYPE NETSCAPE-Bookmark-file-1><DL>';
    const link =
      source === 'pocket'
        ? '<li><a href="https://example.test">Example</a></li>'
        : '<DT><A HREF="https://example.test">Example</A>';
    expect(() => run(prefix + link.repeat(IMPORT_MAX_ROWS + 1), { source })).toThrow(
      expect.objectContaining({ status: 400 }),
    );
    expect(db.prepare('select count(*) as count from bookmark').get()).toEqual({ count: 0 });
  });

  it('rejects excessively wide CSVs and reports excessive tag entries without saving them', () => {
    expect(() => run('url,' + Array.from({ length: 100 }, (_, i) => `column${i}`).join(','))).toThrow(
      expect.objectContaining({ status: 400 }),
    );
    const tags = Array.from({ length: 101 }, (_, i) => `tag${i}`).join(',');
    expect(run(`url,tags\nhttps://example.test,"${tags}"`)).toMatchObject({ imported: 0, failed: 1 });
    expect(db.prepare('select count(*) as count from tag').get()).toEqual({ count: 0 });
  });

  it('limits browser folder nesting', () => {
    const html =
      '<!DOCTYPE NETSCAPE-Bookmark-file-1>' +
      '<DL>'.repeat(129) +
      '<DT><A HREF="https://example.test">Example</A>' +
      '</DL>'.repeat(129);
    expect(() => run(html, { source: 'netscape-bookmark-file-1' })).toThrow(expect.objectContaining({ status: 400 }));
  });
});
