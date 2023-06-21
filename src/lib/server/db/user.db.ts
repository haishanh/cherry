import type Sqlite from 'better-sqlite3';

import type { InputCreatePasswordlessUser, InputCreateUser } from '$lib/type';
import * as passwordUtil from '$lib/utils/password.util';

import { DEFAULT_USER_FEATURE } from '../services/user.service';

export function getUserByUsername(
  db: Sqlite.Database,
  input: { username: string },
): {
  id: number;
  username: string;
  feature: number;
} {
  const stmt = db.prepare(`select id,username,feature from user where username = ?`);
  return stmt.get([input.username]);
}

export function getUserPaswordByUsername(db: Sqlite.Database, input: { username: string }) {
  const stmt = db.prepare(`select id,username,password,feature from user where username = ?`);
  return stmt.get([input.username]);
}

export function deleteUserById(db: Sqlite.Database, input: { id: number }) {
  return db.prepare('delete from user where id = ?').run([input.id]);
}

export function getUserById(
  db: Sqlite.Database,
  input: { id: number },
): {
  id: number;
  username: string;
  password: string;
  feature: number;
} {
  const stmt = db.prepare(`select id,username,password,feature from user where id = ?`);
  return stmt.get([input.id]);
}

export function getUserPasswordById(db: Sqlite.Database, input: { id: number }) {
  const stmt = db.prepare(`select id,username,password from user where id = ?`);
  return stmt.get([input.id]);
}

export async function createUser(
  db: Sqlite.Database,
  input: InputCreateUser | InputCreatePasswordlessUser,
): Promise<{ id: number; username: string; feature: number }> {
  const stmt = db.prepare(`
    insert into user (username, password, feature, createdAt, updatedAt) 
    values (@username, @password, @feature, strftime('%s','now'), strftime('%s','now'))
  `);
  let hashed: string | null;
  if ('password' in input) {
    hashed = await passwordUtil.hash(input.password);
  } else {
    hashed = null;
  }
  const username = input.username ?? '';
  const ret = stmt.run({ username, password: hashed, feature: DEFAULT_USER_FEATURE });
  return { id: ret.lastInsertRowid as number, username, feature: DEFAULT_USER_FEATURE };
}

export async function updateUserPassword(db: Sqlite.Database, input: { userId: number; newPassword: string }) {
  const stmt = db.prepare('update user set password = ? where id = ?');
  const hashed = await passwordUtil.hash(input.newPassword);
  return stmt.run([hashed, input.userId]);
}

export async function updateUserFeature(db: Sqlite.Database, input: { userId: number; feature: number }) {
  const stmt = db.prepare('update user set feature = ? where id = ?');
  return stmt.run([input.feature, input.userId]);
}
