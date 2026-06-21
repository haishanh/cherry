import { randomUUID } from 'node:crypto';
import * as fs from 'node:fs/promises';

import type Sqlite from 'better-sqlite3';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { lite } from '../db/common.db';
import { createCliAdminCommands } from './cli';

describe('admin cli commands', () => {
  let dbFile: string;
  let db: Sqlite.Database;
  let commands: ReturnType<typeof createCliAdminCommands>;

  beforeEach(() => {
    dbFile = '_.' + randomUUID() + '.sqlite';
    db = lite(dbFile);
    commands = createCliAdminCommands(db);
  });

  afterEach(async () => {
    await fs.rm(dbFile, { force: true });
  });

  it('lists existing users without passwords', async () => {
    await commands.createUser('admin@example.com', 'secret-1', { admin: true });
    await commands.createUser('user@example.com', 'secret-2', { admin: false });

    const res = await commands.listUsers();
    expect(res.status).toBe(200);

    const body = (await res.json()) as {
      items: Array<{ id: number; username: string; feature: number; attr: number }>;
    };
    expect(body.items).toHaveLength(2);
    expect(body.items.map((item) => item.username).sort()).toEqual(['admin@example.com', 'user@example.com']);
    expect(body.items.every((item) => !('password' in item))).toBe(true);
  });

  it('creates an admin user', async () => {
    const res = await commands.createUser('admin@example.com', 'P@ssw0rd', { admin: true });
    expect(res.status).toBe(204);

    const user = db.prepare('select username, attr from user where username = ?').get(['admin@example.com']) as {
      username: string;
      attr: number;
    };
    expect(user.username).toBe('admin@example.com');
    expect(user.attr & 1).toBe(1);
  });

  it('updates password and toggles admin flag', async () => {
    await commands.createUser('user@example.com', 'old-password', { admin: false });

    expect((await commands.setAdmin('user@example.com')).status).toBe(204);
    expect((await commands.updateUserPassword('user@example.com', 'new-password')).status).toBe(204);
    expect((await commands.unsetAdmin('user@example.com')).status).toBe(204);

    const user = db.prepare('select attr, password from user where username = ?').get(['user@example.com']) as {
      attr: number;
      password: string;
    };
    expect(user.attr & 1).toBe(0);
    expect(user.password).toBeTypeOf('string');
    expect(user.password).not.toContain('new-password');
  });

  it('deletes user resources together with the user', async () => {
    await commands.createUser('delete-me@example.com', 'secret', { admin: false });
    const user = db.prepare('select id from user where username = ?').get(['delete-me@example.com']) as { id: number };

    db.prepare(
      "insert into tag (name, userId, createdAt, updatedAt) values ('t1', ?, strftime('%s','now'), strftime('%s','now'))",
    ).run([user.id]);
    db.prepare(
      "insert into cherry_group (name, userId, createdAt, updatedAt) values ('g1', ?, strftime('%s','now'), strftime('%s','now'))",
    ).run([user.id]);
    db.prepare(
      "insert into bookmark (userId, url, title, desc, createdAt, updatedAt) values (?, 'https://example.com', 't', 'd', strftime('%s','now'), strftime('%s','now'))",
    ).run([user.id]);
    db.prepare(
      "insert into bookmark_stash (key, userId, data, createdAt) values ('stash', ?, '[]', strftime('%s','now'))",
    ).run([user.id]);
    db.prepare(
      "insert into job (userId, op, status, exp, input, output, error, createdAt) values (?, 'export', 'FINISHED', 0, '{}', '{}', '', strftime('%s','now'))",
    ).run([user.id]);

    const res = await commands.deleteUser(user.id, 'delete-me@example.com');
    expect(res.status).toBe(204);

    expect(db.prepare('select count(*) as count from user where id = ?').get([user.id])).toEqual({ count: 0 });
    expect(db.prepare('select count(*) as count from bookmark where userId = ?').get([user.id])).toEqual({ count: 0 });
    expect(db.prepare('select count(*) as count from tag where userId = ?').get([user.id])).toEqual({ count: 0 });
    expect(db.prepare('select count(*) as count from cherry_group where userId = ?').get([user.id])).toEqual({
      count: 0,
    });
    expect(db.prepare('select count(*) as count from bookmark_stash where userId = ?').get([user.id])).toEqual({
      count: 0,
    });
    expect(db.prepare('select count(*) as count from job where userId = ?').get([user.id])).toEqual({ count: 0 });
  });

  it('migrates into a new database file', async () => {
    await commands.createUser('migrate@example.com', 'secret', { admin: false });
    const toFile = '_.' + randomUUID() + '.sqlite';

    try {
      const res = await commands.migration(toFile);
      expect(res.status).toBe(200);
      const migrated = lite(toFile, false);
      expect(migrated.prepare('select count(*) as count from user').get()).toEqual({ count: 1 });
    } finally {
      await fs.rm(toFile, { force: true });
    }
  });
});
