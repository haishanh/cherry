import { randomUUID } from 'node:crypto';
import * as fs from 'node:fs/promises';

import { test } from 'uvu';
import * as assert from 'uvu/assert';

import { lite } from './common.db';
import * as userDb from './user.db';

{
  test.before.each((ctx) => {
    ctx.dbFile = '_.' + randomUUID() + '.sqlite';
    ctx.db = lite(ctx.dbFile);
  });

  test.after.each(async (ctx) => {
    await fs.unlink(ctx.dbFile);
  });

  test('getUserByUsername', async (ctx) => {
    const user = await userDb.createUser(ctx.db, { username: 'u1', password: '123 ' });
    const ret = userDb.getUserByUsername(ctx.db, { username: user.username });
    assert.equal(ret.username, 'u1');
  });

  test.run();
}
