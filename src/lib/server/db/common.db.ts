import assert from 'assert';
import Sqlite from 'better-sqlite3';

import { DATABASE_PATH } from '$lib/env';
import { logger } from '$lib/server/logger';

import * as v1 from './migrations/v01.migration';
import * as v2 from './migrations/v02.migration';
import * as v4 from './migrations/v04.migration';
import * as v5 from './migrations/v05.migration';

const DATABASE_STATE: Record<string, { db: Sqlite.Database; migrated?: boolean }> = {};

const migrations = [
  { version: 1, mod: v1 },
  { version: 2, mod: v2 },
  { version: 4, mod: v4 },
  { version: 5, mod: v5 },
];

export const lite = (filepath = DATABASE_PATH, shouldMigrate = true, verbose = false) => {
  if (DATABASE_STATE[filepath]) return DATABASE_STATE[filepath].db;
  const db = new Sqlite(filepath, {
    ...(verbose ? { verbose: console.log } : undefined),
  });
  DATABASE_STATE[filepath] = { db };
  if (shouldMigrate && !DATABASE_STATE[filepath].migrated) {
    db.pragma('journal_mode = WAL');
    migrate(db);
    DATABASE_STATE[filepath].migrated = true;
  }

  process.on('exit', () => db.close());
  process.on('SIGHUP', () => process.exit(128 + 1));
  process.on('SIGINT', () => process.exit(128 + 2));
  process.on('SIGTERM', () => process.exit(128 + 15));

  return db;
};

function migrate(db: Sqlite.Database) {
  const run = db.transaction(() => {
    let version = 0;
    try {
      const row = db.prepare(`select version from migration where rowid = 1`).get() as { version: number };
      assert(typeof row.version === 'number');
      version = row.version;
    } catch (e) {
      if (e instanceof Sqlite.SqliteError && e.code === 'SQLITE_ERROR') {
        db.prepare(`CREATE TABLE IF NOT EXISTS migration(version INTEGER)`).run();
        db.prepare('INSERT INTO migration (version) VALUES (@version)').run({ version: 0 });
      } else {
        logger.error({ error: e });
        throw e;
      }
    }
    let prevVersion = 0;
    for (const m of migrations) {
      assert(m.mod);
      // ensure the version in the module is what we expected
      // actually we only need this information in one place
      // but have it specified both inside and outside the module can reduce fault due to carelessness
      assert(m.version === m.mod.version);
      // expect it is already sorted
      assert(m.version > prevVersion);
      prevVersion = m.version;
      if (m.version > version) {
        m.mod.up(db);
        db.prepare('update migration set version = @version where rowid = 1').run({ version: m.version });
      }
    }
  });
  run();
}

export function hasColumn(db: Sqlite.Database, opts: { table: string; column: string; type?: string }) {
  const { table, column, type } = opts;
  const ret = db.pragma(`table_info(${table})`) as { cid: number; name: string; type: string }[];
  const c = ret.find((item) => item.name === column);
  if (c && type) {
    return c.type.toLowerCase() === type.toLowerCase();
  }
  return !!c;
}

export enum DataErrorCode {
  TagAlreadyExits,
  BookmarkNotFound,
  UserNotFound,
}

export class DataError extends Error {
  constructor(public code: DataErrorCode) {
    super('' + code);
    Error.captureStackTrace(this, this.constructor);
  }
}

export function isConflict(e: Error) {
  return e instanceof Sqlite.SqliteError && e.code === 'SQLITE_CONSTRAINT_UNIQUE';
}
