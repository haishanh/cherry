// export function clean

import type { Database } from 'better-sqlite3';

import type { BookmarkStashFromDb, InputAllBookmarkStash } from '$lib/type';

import { delete_from, Eq, OrderByDir, select_from } from './builder2';
import { Column, Table } from './identifier';

export function all(db: Database, input: InputAllBookmarkStash) {
  const cols = Column.BookmarkStash;
  const limit = typeof input.limit === 'number' ? input.limit : 100;
  const builder = select_from(Table.BookmarkStash, [cols.Id, cols.CreatedAt])
    .orderBy(cols.CreatedAt, OrderByDir.Descending)
    .limit(limit);
  const { source, params } = builder.build();
  const stmt = db.prepare(source);
  return stmt.all(params) as BookmarkStashFromDb[];
}

export function deleteMany(db: Database, input: { ids: number[] }) {
  const cols = Column.BookmarkStash;
  const { source } = delete_from(Table.BookmarkStash).where(Eq(cols.Id, '__not-used')).build();
  const stmt = db.prepare(source);
  const transact = db.transaction(() => input.ids.map((id) => stmt.run([id])));
  transact();
}
