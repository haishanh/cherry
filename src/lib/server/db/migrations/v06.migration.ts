import type { Database } from 'better-sqlite3';

import { trigger } from '../builder';

export const version = 6;

// migrate to fts to use https://github.com/wangfenjin/simple
// the new table is bookmark_fts_v2
// the previous table bookmark_fts will be dropped
// fts related triggers will be dropped and recreated

export const up = (db: Database) => {
  db.prepare(
    `create virtual table if not exists bookmark_fts_v2 USING fts5 (title,desc,url,content=bookmark,content_rowid=id,tokenize='simple')`,
  ).run();
  db.prepare(`insert into bookmark_fts_v2(bookmark_fts_v2) values('rebuild')`).run();
  db.prepare(`drop trigger if exists bookmark_insert_trigger`).run();
  db.prepare(
    trigger.create({
      name: 'bookmark_insert_trigger_6_1',
      ifNotExists: true,
      event: 'after insert',
      table: 'bookmark',
      statements: [`update user set bookmarkCount = bookmarkCount + 1 where id = new.userId`],
    }),
  ).run();

  db.prepare(
    trigger.create({
      name: 'bookmark_insert_trigger_6_2',
      ifNotExists: true,
      event: 'after insert',
      table: 'bookmark',
      statements: [`insert into bookmark_fts_v2(rowid,title,desc,url) values (new.id,new.title,new.desc,new.url)`],
    }),
  ).run();

  db.prepare(`drop trigger if exists bookmark_delete_trigger`).run();
  db.prepare(
    trigger.create({
      name: 'bookmark_delete_trigger_6_1',
      ifNotExists: true,
      event: 'after delete',
      table: 'bookmark',
      statements: [
        `insert into bookmark_fts_v2 (bookmark_fts_v2,rowid,title,desc,url) values ('delete',old.id,old.title,old.desc,old.url)`,
      ],
    }),
  ).run();
  db.prepare(
    trigger.create({
      name: 'bookmark_delete_trigger_6_2',
      ifNotExists: true,
      event: 'after delete',
      table: 'bookmark',
      statements: [`delete from bookmark_tag where bookmarkId = old.id`],
    }),
  ).run();
  db.prepare(
    trigger.create({
      name: 'bookmark_delete_trigger_6_3',
      ifNotExists: true,
      event: 'after delete',
      table: 'bookmark',
      statements: [`update user set bookmarkCount = bookmarkCount - 1 where id = old.userId`],
    }),
  ).run();

  db.prepare(`drop trigger if exists bookmark_update_trigger`).run();
  db.prepare(
    trigger.create({
      name: 'bookmark_update_trigger_6_0',
      ifNotExists: true,
      event: 'after update',
      table: 'bookmark',
      statements: [
        `insert into bookmark_fts_v2 (bookmark_fts_v2,rowid,title,desc,url) values ('delete',old.id,old.title,old.desc,old.url)`,
        `insert into bookmark_fts_v2(rowid,title,desc,url) values (new.id,new.title,new.desc,new.url)`,
      ],
    }),
  ).run();
  db.prepare(`drop table if exists bookmark_fts`).run();
};
