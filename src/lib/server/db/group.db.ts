import Sqlite from 'better-sqlite3';

import type {
  InputBatchUpsertGroup,
  InputBatchUpsertGroupItem,
  InputCreateGroup,
  InputDeleteGroup,
  InputGetAllGroups,
  InputUpdateGroup,
} from '$lib/type';

import { logger } from '../logger';

const GroupQueryInsertV0 = `insert into cherry_group (name, userId, createdAt, updatedAt) values (@name, @userId, strftime('%s','now'), strftime('%s','now')) returning *`;

export function create(db: Sqlite.Database, input: InputCreateGroup) {
  const stmt = db.prepare(GroupQueryInsertV0);
  return stmt.get(input) as { id: number };
}

export function batchUpsertGroup(db: Sqlite.Database, input: InputBatchUpsertGroup) {
  const stmt0 = db.prepare(GroupQueryInsertV0);
  const { userId, items } = input;
  const result: Array<number | InputBatchUpsertGroupItem> = [];
  const transact = db.transaction(() => {
    for (const item of items) {
      if (!item.name) {
        result.push(item);
        continue;
      }
      try {
        const ret = stmt0.run({ userId, name: item.name });
        result.push(ret.lastInsertRowid as number);
      } catch (e) {
        if (e instanceof Sqlite.SqliteError && e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
          const g = getGroupByName(db, { name: item.name, userId });
          result.push(g.id);
        } else {
          logger.error('batchUpsertGroup', e);
          result.push(item);
        }
      }
    }
  });
  transact();
  return { result };
}

export function upsert(db: Sqlite.Database, input: InputCreateGroup): { id: number } {
  try {
    return create(db, input);
  } catch (e) {
    if (e instanceof Sqlite.SqliteError && e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return getGroupByName(db, { name: input.name, userId: input.userId });
    }
    throw e;
  }
}

export function all(db: Sqlite.Database, input: InputGetAllGroups) {
  const stmt = db.prepare(['select id, name, count from cherry_group', 'where userId = ? order by id desc'].join(' '));
  return stmt.all([input.userId]);
}

export function getGroupByName(db: Sqlite.Database, input: { name: string; userId: number }) {
  const stmt = db.prepare('select id,name from cherry_group where userId = ? AND name = ?');
  return stmt.get([input.userId, input.name]) as { id: number; name: string };
}

export function updateGroupById(db: Sqlite.Database, input: InputUpdateGroup) {
  const stmt = db.prepare('UPDATE cherry_group SET name = ? where id = ? AND userId = ?');
  return stmt.run([input.name, input.id, input.userId]);
}

export function deleteGroupById(db: Sqlite.Database, input: InputDeleteGroup) {
  const stmt = db.prepare('DELETE FROM cherry_group WHERE id = ? AND userId = ?');
  return stmt.run([input.id, input.userId]);
}

export function deleteGroupsByUserId(db: Sqlite.Database, input: { userId: number }) {
  const stmt = db.prepare('DELETE FROM cherry_group WHERE userId = ?');
  return stmt.run([input.userId]);
}
