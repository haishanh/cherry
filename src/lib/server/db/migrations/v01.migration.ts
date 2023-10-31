import type Sqlite from 'better-sqlite3';

import { index, table, trigger } from '../builder';

export const version = 1;

export const up = (db: Sqlite.Database) => {
  db.prepare(
    table.create({
      name: 'bookmark',
      ifNotExists: true,
      column: {
        id: 'integer PRIMARY KEY AUTOINCREMENT',
        userId: 'integer',
        groupId: 'integer',
        url: 'text',
        title: 'text',
        desc: 'text',
        createdAt: 'integer',
        updatedAt: 'integer',
      },
      constraints: ['unique (url, userId)'],
    }),
  ).run();

  db.prepare(
    index.create({
      name: 'bookmark_idx_userId_updatedAt',
      ifNotExists: true,
      table: 'bookmark',
      columns: ['userId', 'updatedAt'],
    }),
  ).run();

  db.prepare(
    table.create({
      name: 'user',
      ifNotExists: true,
      column: {
        id: 'integer PRIMARY KEY AUTOINCREMENT',
        username: 'text unique',
        password: 'text',
        createdAt: 'integer',
        updatedAt: 'integer',
        bookmarkCount: 'integer default 0',
        bookmarkCountSyncedAt: 'integer default 0',
      },
    }),
  ).run();

  db.prepare(
    `create virtual table if not exists bookmark_fts USING fts5 (title,desc,url,content=bookmark,content_rowid=id,tokenize='porter unicode61 remove_diacritics 1')`,
  ).run();

  db.prepare(
    table.create({
      name: 'tag',
      ifNotExists: true,
      column: {
        id: 'integer PRIMARY KEY AUTOINCREMENT',
        name: 'text',
        userId: 'integer',
        createdAt: 'integer',
        updatedAt: 'integer',
        count: 'integer default 0',
      },
      constraints: ['unique (userId, name)'],
    }),
  ).run();

  db.prepare(
    table.create({
      name: 'bookmark_tag',
      ifNotExists: true,
      column: { bookmarkId: 'integer', tagId: 'integer' },
      constraints: ['PRIMARY KEY(bookmarkId, tagId)'],
    }),
  ).run();

  db.prepare(
    index.create({
      name: 'bookmark_tag_idx_bookmarkId',
      ifNotExists: true,
      table: 'bookmark_tag',
      columns: ['bookmarkId'],
    }),
  ).run();

  db.prepare(
    table.create({
      name: 'bookmark_stash',
      ifNotExists: true,
      column: {
        id: 'integer PRIMARY KEY AUTOINCREMENT',
        key: 'text',
        userId: 'integer',
        data: 'text',
        createdAt: 'integer',
      },
    }),
  ).run();

  db.prepare(
    index.create({
      name: 'idx_bookmark_stash_key',
      ifNotExists: true,
      table: 'bookmark_stash',
      columns: ['key', 'userId'],
    }),
  ).run();

  db.prepare(
    trigger.create({
      name: 'bookmark_insert_trigger',
      ifNotExists: true,
      event: 'after insert',
      table: 'bookmark',
      statements: [
        `insert into bookmark_fts(rowid,title,desc,url) values (new.id,new.title,new.desc,new.url)`,
        `update user set bookmarkCount = bookmarkCount + 1 where id = new.userId`,
      ],
    }),
  ).run();

  db.prepare(
    trigger.create({
      name: 'bookmark_delete_trigger',
      ifNotExists: true,
      event: 'after delete',
      table: 'bookmark',
      statements: [
        `insert into bookmark_fts (bookmark_fts,rowid,title,desc,url) values ('delete',old.id,old.title,old.desc,old.url)`,
        `delete from bookmark_tag where bookmarkId = old.id`,
        `update user set bookmarkCount = bookmarkCount - 1 where id = old.userId`,
      ],
    }),
  ).run();

  db.prepare(
    trigger.create({
      name: 'bookmark_update_trigger',
      ifNotExists: true,
      event: 'after update',
      table: 'bookmark',
      statements: [
        `insert into bookmark_fts (bookmark_fts,rowid,title,desc,url) values ('delete',old.id,old.title,old.desc,old.url)`,
        `insert into bookmark_fts(rowid,title,desc,url) values (new.id,new.title,new.desc,new.url)`,
      ],
    }),
  ).run();

  db.prepare(
    trigger.create({
      name: 'bookmark_tag_insert_trigger',
      ifNotExists: true,
      event: 'after insert',
      table: 'bookmark_tag',
      statements: [`update tag set count = count + 1 where id = new.tagId`],
    }),
  ).run();

  db.prepare(
    trigger.create({
      name: 'bookmark_tag_delete_trigger',
      ifNotExists: true,
      event: 'after delete',
      table: 'bookmark_tag',
      statements: [`update tag set count = count - 1 where id = old.tagId`],
    }),
  ).run();

  db.prepare(
    trigger.create({
      name: 'tag_delete_trigger',
      ifNotExists: true,
      event: 'after delete',
      table: 'tag',
      statements: [`delete from bookmark_tag where tagId = old.id`],
    }),
  ).run();

  db.prepare(
    table.create({
      name: 'cherry_group',
      ifNotExists: true,
      column: {
        id: 'integer PRIMARY KEY AUTOINCREMENT',
        name: 'text',
        userId: 'integer',
        createdAt: 'integer',
        updatedAt: 'integer',
        count: 'integer default 0',
      },
      constraints: ['unique (userId, name)'],
    }),
  ).run();

  db.prepare(
    index.create({
      name: 'bookmark_idx_groupId',
      ifNotExists: true,
      table: 'bookmark',
      columns: ['groupId'],
    }),
  ).run();

  db.prepare(
    trigger.create({
      name: 'bookmark_insert_trigger_1',
      ifNotExists: true,
      event: 'after insert',
      table: 'bookmark',
      statements: ['update cherry_group set count = count + 1 where id = new.groupId AND userId = new.userId'],
    }),
  ).run();

  db.prepare(
    trigger.create({
      name: 'bookmark_delete_trigger_1',
      ifNotExists: true,
      event: 'after delete',
      table: 'bookmark',
      statements: ['update cherry_group set count = count - 1 where id = old.groupId AND userId = old.userId'],
    }),
  ).run();

  db.prepare(
    trigger.create({
      name: 'bookmark_update_trigger_1',
      ifNotExists: true,
      event: 'after update',
      table: 'bookmark',
      statements: [
        'update cherry_group set count = count - 1 where id = old.groupId AND userId = old.userId',
        'update cherry_group set count = count + 1 where id = new.groupId AND userId = new.userId',
      ],
    }),
  ).run();

  db.prepare(
    trigger.create({
      name: 'cherry_group_delete_trigger_0',
      ifNotExists: true,
      event: 'after delete',
      table: 'cherry_group',
      statements: ['update bookmark set groupId = NULL where groupId = old.id AND userId = old.userId'],
    }),
  ).run();
};
