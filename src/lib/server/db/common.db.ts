import path from 'node:path';

import assert from 'assert';
import Sqlite from 'better-sqlite3';

import { DATABASE_PATH } from '$lib/env';
import { logger } from '$lib/server/logger';

import { up as up1, version as version1 } from './migrations/v01.migration';
import { up as up2, version as version2 } from './migrations/v02.migration';
import { up as up4, version as version4 } from './migrations/v04.migration';
import { up as up5, version as version5 } from './migrations/v05.migration';
import { up as up6, version as version6 } from './migrations/v06.migration';
import { up as up7, version as version7 } from './migrations/v07.migration';
import { up as up8, version as version8 } from './migrations/v08.migration';

const DATABASE_STATE: Record<string, { db: Sqlite.Database; migrated?: boolean }> = {};

const migrations = [
  { version: version1, mod: { up: up1, version: version1 } },
  { version: version2, mod: { up: up2, version: version2 } },
  { version: version4, mod: { up: up4, version: version4 } },
  { version: version5, mod: { up: up5, version: version5 } },
  // Active v6 is teardown-only. The historical `simple` tokenizer migration is preserved in v06.legacy.migration.ts.
  { version: version6, mod: { up: up6, version: version6 } },
  { version: version7, mod: { up: up7, version: version7 } },
  { version: version8, mod: { up: up8, version: version8 } },
];

export const lite = (filepath = DATABASE_PATH, shouldMigrate = true, verbose = false) => {
  if (DATABASE_STATE[filepath]) return DATABASE_STATE[filepath].db;
  const db = new Sqlite(filepath, {
    ...(verbose ? { verbose: console.log } : undefined),
  });

  const extensionPath = path.join('db', 'libsignal_tokenizer');
  try {
    // better-sqlite3 supports the optional init symbol at runtime, but its TS types only expose the path-only overload.
    (db.loadExtension as unknown as (path: string, entryPoint: string) => Sqlite.Database)(
      extensionPath,
      'signal_fts5_tokenizer_init',
    );
  } catch (error) {
    const message = [
      `Failed to load SQLite extension from ${extensionPath}.`,
      'Run `pnpm fetch:signal-tokenizer` to download the release artifact, or build haishanh/Signal-FTS5-Extension from source and place the library in db/.',
    ].join(' ');
    throw new Error(message, { cause: error });
  }

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
        logger.warn('database migrated to version %s', m.version);
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

export function isConflict(e: unknown) {
  return e instanceof Sqlite.SqliteError && e.code === 'SQLITE_CONSTRAINT_UNIQUE';
}
