import assert from 'assert';
import Database from 'better-sqlite3';

import { DATABASE_PATH, PAGE_BOOKMARK_LIMIT } from '$lib/env';
import type {
  BookmarkCreateDto,
  BookmarkDeleteDto,
  BookmarkFromDb,
  BookmarkGetAllOpts,
  BookmarkGetDto,
  BookmarkRestoreDto,
  BookmarkStashDto,
  BookmarkUpdateDto,
  UserCreateDto,
} from '$lib/type';

import { ApiError, HttpStatus } from './api.error';
import { logger } from './logger';

// import  pino  from 'pino';
// const logger = pino();

type MigrateFn = (db: Database.Database) => void;

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop: MigrateFn = () => {};

const v01 = { version: 1, up: noop, down: noop };
const v02 = { version: 2, up: noop, down: noop };
const v03 = { version: 3, up: noop, down: noop };
const migrations = [v01, v02];

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

  db.prepare(`create index if not exists bookmark_idx_userId_updatedAt on bookmark (userId, updatedAt)`).run();

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

v02.up = (db: Database.Database) => {
  db.prepare(`insert into migration (version) values (@version)`).run({ version: v02.version });
  db.prepare(
    `
    create table if not exists bookmark_stash(
      id integer PRIMARY KEY,
      userId integer,
      data text,
      createdAt integer);
    `
  ).run();
};

v03.up = (db: Database.Database) => {
  db.prepare(
    `
    create table if not exists tag(
      id integer PRIMARY KEY,
      name text,
      userId integer,
      createdAt integer,
      unique (userId, name)
    );
    `
  ).run();
  db.prepare(
    `
    create table if not exists bookmark_tag(
      id integer PRIMARY KEY,
      bookmarkId integer,
      tagId integer);
    `
  ).run();
};

let migrated = false;
function migrate(db: Database.Database) {
  const run = db.transaction(() => {
    let version = 0;
    try {
      const row = db.prepare(`select version from migration`).get();
      assert(typeof row.version === 'number');
      version = row.version;
    } catch (e) {
      // ignore
    }
    for (const m of migrations) {
      if (m.version > version) m.up(db);
    }
  });
  run();
}

let db: Database.Database;
export const lite = () => {
  if (db) return db;

  db = new Database(DATABASE_PATH, { verbose: console.log });
  if (!migrated) {
    db.pragma('journal_mode = WAL');
    migrate(db);
    migrated = true;
  }

  return db;
};

export const bookmark = {
  create: createBookmark,
  update: updateBookmark,
  delete: deleteBookmark,
  stash: stashBookmark,
  restore: restoreBookmark,
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

function getAll(opts: BookmarkGetAllOpts) {
  assert(opts.userId);

  const db = lite();

  let data: BookmarkFromDb[];
  let error: ApiError;
  let stmt: Database.Statement;
  const params: any = { userId: opts.userId };
  if (opts.next) {
    const next = opts.next;
    params.updatedAt = next.updatedAt;
    params.id = next.id;
    stmt = db.prepare(
      `
    select id
         , title
         , desc
         , url
         , updatedAt
      from bookmark
     where userId = @userId and (updatedAt, id) <= (@updatedAt, @id)
  order by updatedAt desc, id desc
    limit ${PAGE_BOOKMARK_LIMIT}
    offset 1
    `
    );
  } else {
    stmt = db.prepare(
      `
    select id
         , title
         , desc
         , url
         , updatedAt
      from bookmark
     where userId = @userId
  order by updatedAt desc, id desc
    limit ${PAGE_BOOKMARK_LIMIT}
    `
    );
  }
  try {
    data = stmt.all(params);
  } catch (e) {
    error = new ApiError(HttpStatus.INTERNAL_SERVER_ERROR);
    logger.error({ error });
  }
  return { data, error };
}

function getBookmark(opts: BookmarkGetDto) {
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
  and userId = @userId
    `
  );
  try {
    const ret = stmt.get({ id: opts.id, userId: opts.userId });
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

function deleteBookmark(opts: BookmarkDeleteDto) {
  const db = lite();
  // const updates: string[] = [];
  const id = opts.id;
  const userId = opts.userId;
  const stmt = db.prepare(
    `
    delete from bookmark
     where id = @id
   and userId = @userId
    `
  );

  let data = null;
  let error: ApiError;
  try {
    const ret = stmt.run({ id, userId });
    if (ret.changes === 0) {
      error = new ApiError(HttpStatus.NOT_FOUND);
    } else {
      data = { id };
    }
  } catch (e) {
    error = new ApiError(HttpStatus.INTERNAL_SERVER_ERROR);
    logger.error({ error });
  }
  return { data, error };
}

function stashBookmark(opts: BookmarkStashDto) {
  const db = lite();
  const id = opts.id;
  const userId = opts.userId;

  const run = db.transaction(() => {
    const stmt0 = db.prepare('select * from bookmark where id = @id and userId = @userId');
    const row = stmt0.get({ id, userId });
    if (!row) {
      throw new ApiError(HttpStatus.NOT_FOUND);
    }
    const data = JSON.stringify(row);

    const stmt1 = db.prepare(
      `
    insert into bookmark_stash (id, userId, data, createdAt)
    values (@id, @userId, @data, strftime('%s','now'))
    `
    );
    stmt1.run({ id, userId, data });

    const stmtDelete = db.prepare('delete from bookmark where id = @id and userId = @userId');
    return stmtDelete.run({ id, userId });
  });

  let data = null;
  let error: ApiError;
  try {
    const ret = run();
    if (ret.changes === 0) {
      error = new ApiError(HttpStatus.NOT_FOUND);
    } else {
      data = { id };
    }
  } catch (e) {
    logger.error({ error: e });
    if (e instanceof ApiError) {
      error = e;
    } else {
      error = new ApiError(HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  return { data, error };
}

function restoreBookmark(opts: BookmarkRestoreDto) {
  const db = lite();
  const id = opts.id;
  const userId = opts.userId;

  const run = db.transaction(() => {
    const stmtRead = db.prepare('select data from bookmark_stash where id = @id and userId = @userId');
    const retRead = stmtRead.get({ id, userId });
    if (!retRead) {
      throw new ApiError(HttpStatus.NOT_FOUND);
    }
    const b = JSON.parse(retRead.data);

    const stmtInsert = db.prepare(
      `
    insert into bookmark (title, desc, url, userId, createdAt, updatedAt)
    values (@title, @desc, @url, @userId, @createdAt, @updatedAt)
      `
    );
    stmtInsert.run(b);

    const stmtDelete = db.prepare('delete from bookmark_stash where id = @id and userId = @userId');
    const retDelete = stmtDelete.run({ id, userId });
    return retDelete;
  });

  let data = null;
  let error: ApiError;
  try {
    const ret = run();
    if (ret.changes === 0) {
      error = new ApiError(HttpStatus.NOT_FOUND);
    } else {
      data = { id };
    }
  } catch (e) {
    logger.error({ error: e });
    if (e instanceof ApiError) {
      error = e;
    } else {
      error = new ApiError(HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  return { data, error };
}

function updateBookmark(opts: BookmarkUpdateDto) {
  const db = lite();
  const updates: string[] = [];

  assert(opts.id, 'Must have id in input');
  const id = opts.id;

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
   and userId = @userId
    `
  );
  let data = null;
  let error: ApiError;
  try {
    const ret = stmt.run(opts);
    if (ret.changes === 0) {
      error = new ApiError(HttpStatus.NOT_FOUND);
    } else {
      data = { id };
    }
  } catch (e) {
    logger.error({ error: e });
    error = new ApiError(HttpStatus.INTERNAL_SERVER_ERROR);
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
  const input = { username: opts.username ?? '', isAdmin: opts.isAdmin ?? 0 };
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
