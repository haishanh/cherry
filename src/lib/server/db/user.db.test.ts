import { randomUUID } from 'node:crypto';
import * as fs from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { it, beforeEach, afterEach, describe, expect } from 'vitest';

import { lite } from './common.db';
import * as userDb from './user.db';
import Sqlite from 'better-sqlite3';

describe('user.db', () => {
  let dbFile: string | undefined;
  let db: Sqlite.Database | undefined;

  beforeEach(() => {
    dbFile = path.join(tmpdir(), '_.' + randomUUID() + '.sqlite');
    db = lite(dbFile);
  });

  afterEach(async () => {
    if (dbFile) {
      await Promise.all([
        fs.rm(dbFile, { force: true }),
        fs.rm(`${dbFile}-wal`, { force: true }),
        fs.rm(`${dbFile}-shm`, { force: true }),
      ]);
    }
  });

  it('getUserByUsername', async () => {
    const user = await userDb.createUser(db!, { username: 'u1', password: '123 ', attr: 0 });
    const ret = userDb.getUserByUsername(db!, { username: user.username });
    expect(ret.username).toEqual('u1');
  });
});
