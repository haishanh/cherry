import type Sqlite from 'better-sqlite3';
import type { Database } from 'better-sqlite3';

import type { UserFromDb } from '$lib/type';
import * as passwordUtil from '$lib/utils/password.util';

import { DEFAULT_USER_FEATURE } from '../services/user.service';
import { delete_from, Eq, insert_into, select_from, update_table, ValueToken } from './builder2';
import { Column, Table } from './identifier';

export function getUserByUsername(db: Sqlite.Database, input: { username: string }) {
  const cols = Column.User;
  const { source, params } = select_from(Table.User, [cols.Id, cols.Username, cols.Feature, cols.Attr])
    .where(Eq(cols.Username, input.username))
    .build();
  const stmt = db.prepare(source);
  return stmt.get(params) as Omit<UserFromDb, 'password'>;
}

export function getUserPaswordByUsername(db: Sqlite.Database, input: { username: string }) {
  const cols = Column.User;
  const { source, params } = select_from(Table.User, [cols.Id, cols.Username, cols.Password, cols.Feature, cols.Attr])
    .where(Eq(cols.Username, input.username))
    .build();
  const stmt = db.prepare(source);
  return stmt.get(params) as UserFromDb;
}

export function deleteUserById(db: Sqlite.Database, input: { id: number }) {
  const cols = Column.User;
  const { source, params } = delete_from(Table.User).where(Eq(cols.Id, input.id)).build();
  return db.prepare(source).run(params);
}

export function getUserById(db: Sqlite.Database, input: { id: number }) {
  const cols = Column.User;
  const { source, params } = select_from(Table.User, [cols.Id, cols.Username, cols.Password, cols.Feature, cols.Attr])
    .where(Eq(cols.Id, input.id))
    .build();
  const stmt = db.prepare(source);
  return stmt.get(params) as UserFromDb;
}

export async function createUser(
  db: Sqlite.Database,
  input: { username: string; password?: string; attr: number },
): Promise<{ id: number; username: string; feature: number; attr: number }> {
  const username = input.username ?? '';
  const { password, attr } = input;
  let hashed: string | null;
  if (typeof password === 'string' && password !== '') {
    hashed = await passwordUtil.hash(password);
  } else {
    hashed = null;
  }
  const cols = Column.User;
  const { source, params } = insert_into(Table.User)
    .column(cols.Username, username)
    .column(cols.Password, hashed)
    .column(cols.Feature, DEFAULT_USER_FEATURE)
    .column(cols.Attr, attr)
    .column(cols.CreatedAt, ValueToken.Now)
    .column(cols.UpdatedAt, ValueToken.Now)
    .build();
  const stmt = db.prepare(source);
  return stmt.get(params) as UserFromDb;
}

export async function updateUserPassword(db: Sqlite.Database, input: { userId: number; newPassword: string }) {
  const hashed = await passwordUtil.hash(input.newPassword);
  const cols = Column.User;
  const { source, params } = update_table(Table.User)
    .where(Eq(cols.Id, input.userId))
    .column(cols.Password, hashed)
    .column(cols.UpdatedAt, ValueToken.Now)
    .build();
  const stmt = db.prepare(source);
  return stmt.run(params);
}

export function updateUserFeature(db: Sqlite.Database, input: { userId: number; feature: number }) {
  const cols = Column.User;
  const { source, params } = update_table(Table.User)
    .where(Eq(cols.Id, input.userId))
    .column(cols.Feature, input.feature)
    .column(cols.UpdatedAt, ValueToken.Now)
    .build();
  const stmt = db.prepare(source);
  return stmt.run(params);
}

export function updateUserAttr(db: Database, input: { id: number; attr: number }) {
  const cols = Column.User;
  const { source, params } = update_table(Table.User)
    .where(Eq(cols.Id, input.id))
    .column(cols.Attr, input.attr)
    .column(cols.UpdatedAt, ValueToken.Now)
    .build();
  const stmt = db.prepare(source);
  return stmt.run(params);
}
