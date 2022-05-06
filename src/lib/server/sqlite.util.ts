import Database from 'better-sqlite3';
import assert from 'assert';
import { DATABASE_PATH } from '$lib/env';
import { HttpStatus, ApiError } from './api.error';

import { logger } from './logger';
import type { BookmarkCreateDto, BookmarkUpdateDto, BookmarkFromDb, UserCreateDto } from '$lib/type';

// import  pino  from 'pino';
// const logger = pino();

type MigrateFn = (db: Database.Database) => void;

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop: MigrateFn = () => {};

const v01 = { version: 1, up: noop, down: noop };

v01.up = (db: Database.Database) => {
  db.prepare(`CREATE TABLE IF NOT EXISTS migration(version INTEGER)`).run();

  db.prepare(
    `
    create table if not exists bookmark(
      id integer PRIMARY KEY,
      title text,
      desc text,
      url text,
      userId integer,
      createdAt integer,
      updatedAt integer);
    `
  ).run();

  db.prepare(
    `
    create index if not exists bookmark_updatedAt_idx on bookmark (updatedAt)
    `
  ).run();

  db.prepare(
    `
    create index if not exists bookmark_userId_idx on bookmark (userId)
    `
  ).run();

  db.prepare(
    `
    create table if not exists user(
      id integer,
      username text unique,
      password text,
      createdAt integer,
      updatedAt integer,
      isAdmin integer,
      isBlocked integer,
      PRIMARY KEY(id))
    `
  ).run();

  db.prepare(
    `
    create virtual table if not exists bookmark_fts USING fts5 (
      title, desc, userId, url UNINDEXED, content=bookmark, content_rowid=id,
      tokenize = 'porter unicode61 remove_diacritics 1')
    `
  ).run();

  db.prepare(
    `
    create trigger if not exists bookmark_insert_trigger after insert on bookmark begin
      insert into bookmark_fts(rowid, title, desc, userId, url)
      values (new.id, new.title, new.desc, new.userId, new.url);
    end
    `
  ).run();

  db.prepare(
    `
    create trigger if not exists bookmark_delete_trigger after delete on bookmark begin
      insert into bookmark_fts (bookmark_fts, rowid, title, desc, userId, url)
      values ('delete', old.id, old.title, old.desc, old.userId, old.url);
    end
    `
  ).run();

  db.prepare(
    `
    create trigger if not exists bookmark_update_trigger after update on bookmark begin
      insert into bookmark_fts (bookmark_fts, rowid, title, desc, userId, url)
      values ('delete', old.id, old.title, old.desc, old.userId, old.url);
      insert into bookmark_fts(rowid, title, desc, userId, url)
      values (new.id, new.title, new.desc, new.userId, new.url);
    end;
    `
  ).run();

  db.prepare(
    ` insert into migration (version)
      values (@version)`
  ).run({ version: v01.version });
};

let migrated = false;
function migrate(db: Database.Database) {
  const run = db.transaction(() => {
    v01.up(db);
  });
  run();
}

let db: Database.Database;
export const lite = () => {
  if (db) return db;

  db = new Database(DATABASE_PATH);
  if (!migrated) {
    migrate(db);
    migrated = true;
  }

  return db;
};

export const bookmark = {
  create: createBookmark,
  update: updateBookmark,
  get: getBookmark,
  all: getAll,
  search: searchBookmark,
};

export const user = {
  create: createUser,
  // get user by username
  get: getUser,
};

function searchBookmark(userId: number, opts: { text: string }) {
  const db = lite();
  let data: BookmarkFromDb[];
  let error: ApiError;
  const stmt = db.prepare(
    `
    select rowid as id, title, desc, url
      from bookmark_fts
     where userId = @userId
       and bookmark_fts match @text
     order by rank;
    `
  );

  try {
    data = stmt.all({ userId, text: opts.text });
  } catch (e) {
    error = new ApiError(HttpStatus.INTERNAL_SERVER_ERROR);
    logger.error({ error });
  }
  return { data, error };
}

function getAll(opts: { userId: number }) {
  assert(opts.userId);

  const db = lite();

  let data: BookmarkFromDb[];
  let error: ApiError;
  const stmt = db.prepare(
    `
    select id
         , title
         , desc
         , url
      from bookmark
     where userId = @userId
  order by updatedAt desc
    `
  );
  try {
    data = stmt.all({ userId: opts.userId });
  } catch (e) {
    error = new ApiError(HttpStatus.INTERNAL_SERVER_ERROR);
    logger.error({ error });
  }
  return { data, error };
}

function getBookmark(opts: { id: string | number }) {
  const db = lite();

  let data: { id: number; title: string; desc: string; url: string };
  let error: ApiError;
  const stmt = db.prepare(
    `
    select id
         , title
         , desc
         , url
      from bookmark
     where id = @id
    `
  );
  try {
    const ret = stmt.get({ id: opts.id });
    data = ret;
  } catch (e) {
    error = new ApiError(HttpStatus.INTERNAL_SERVER_ERROR);
    logger.error({ error });
  }
  return { data, error };
}

function createBookmark(userId: number, opts: BookmarkCreateDto) {
  const db = lite();
  const stmt = db.prepare(
    `
    insert into bookmark (title, desc, url, userId, createdAt, updatedAt)
    values (@title, @desc, @url, @userId, strftime('%s','now'), strftime('%s','now'))
    `
  );
  let data: { id: number };
  let error: ApiError;

  const input = { title: opts.title ?? '', desc: opts.desc ?? '', url: opts.url ?? '', userId };
  try {
    const ret = stmt.run(input);
    data = { id: ret.lastInsertRowid as number };
  } catch (e) {
    if (e instanceof Database.SqliteError && e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      error = new ApiError(HttpStatus.CONFLICT);
    } else {
      error = new ApiError(HttpStatus.INTERNAL_SERVER_ERROR);
      logger.error({ error: e });
    }
  }
  return { data, error };
}

function updateBookmark(opts: BookmarkUpdateDto) {
  const db = lite();
  const updates: string[] = [];

  assert(opts.id, 'Must have id in input');

  for (const field in opts) {
    if (field === 'id' || !opts[field]) continue;
    updates.push(`${field} = @${field}`);
  }
  updates.push("updatedAt = strftime('%s', 'now')");
  const updateStr = updates.join(',');

  const stmt = db.prepare(
    `
    update bookmark
       set ${updateStr}
     where id = @id
    `
  );
  const data = null;
  let error: ApiError;
  try {
    const ret = stmt.run(opts);
    if (ret.changes === 0) {
      error = new ApiError(HttpStatus.NOT_FOUND);
    }
  } catch (e) {
    error = new ApiError(HttpStatus.INTERNAL_SERVER_ERROR);
    logger.error({ error });
  }
  return { data, error };
}

function createUser(opts: UserCreateDto) {
  const db = lite();
  const stmt = db.prepare(
    `
    insert into user (username, isAdmin, createdAt, updatedAt)
    values (@username, @isAdmin, strftime('%s','now'), strftime('%s','now'))
    `
  );
  let data: { id: number };
  let error: ApiError;
  const input = { username: opts.username ?? '', isAdmin: opts.isAdmin ?? '' };
  try {
    const ret = stmt.run(input);
    data = { id: ret.lastInsertRowid as number };
  } catch (e) {
    if (e instanceof Database.SqliteError && e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      error = new ApiError(HttpStatus.CONFLICT);
    } else {
      error = new ApiError(HttpStatus.INTERNAL_SERVER_ERROR);
      logger.error({ error: e });
    }
  }
  return { data, error };
}

function getUser(opts: { username: string }) {
  const db = lite();

  let data: { id: number; username: string; isAdmin: number };
  let error: ApiError;
  const stmt = db.prepare(
    `
    select id
         , username
         , isAdmin
      from user
     where username = @username
    `
  );
  try {
    const ret = stmt.get({ username: opts.username });
    data = ret;
  } catch (e) {
    error = new ApiError(HttpStatus.INTERNAL_SERVER_ERROR);
    logger.error({ error });
  }
  return { data, error };
}
