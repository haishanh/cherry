import type { Database } from 'better-sqlite3';

import {
  type InputAllJob,
  type InputCreateJob,
  type InputDeleteManyJobs,
  type InputUpdateJobError,
  type InputUpdateJobOutput,
  type JobFromDb,
  JobStatus,
} from '$lib/type';

import { delete_from, Eq, insert_into, OrderByDir, select_from, update_table, ValueToken } from './builder2';
import { Column, Table } from './identifier';

export function get(db: Database, input: { id: number }) {
  const cols = Column.Job;
  const { source, params } = select_from(Table.Job, [
    cols.Id,
    cols.UserId,
    cols.Status,
    cols.Op,
    cols.Exp,
    cols.Input,
    cols.Output,
    cols.Error,
    cols.CreatedAt,
    cols.FinishedAt,
  ])
    .where(Eq(cols.Id, input.id))
    .build();
  const stmt = db.prepare(source);
  return stmt.get(params) as JobFromDb;
}

export function all(db: Database, input: InputAllJob) {
  const cols = Column.Job;
  const limit = typeof input.limit === 'number' ? input.limit : 100;
  const builder = select_from(Table.Job, [
    cols.Id,
    cols.UserId,
    cols.Status,
    cols.Op,
    cols.Exp,
    cols.Input,
    cols.Output,
    cols.Error,
    cols.CreatedAt,
    cols.FinishedAt,
  ])
    .orderBy(cols.CreatedAt, OrderByDir.Descending)
    .limit(limit);
  if (input.userId) builder.where(Eq(cols.UserId, input.userId));
  if (input.op) builder.where(Eq(cols.Op, input.op));
  const { source, params } = builder.build();
  const stmt = db.prepare(source);
  return stmt.all(params) as JobFromDb[];
}

export function createJob(db: Database, i: InputCreateJob) {
  const { user, op, exp, input } = i;
  const userId = user.userId;
  const cols = Column.Job;
  const { source, params } = insert_into(Table.Job)
    .column(cols.UserId, userId)
    .column(cols.Op, op)
    .column(cols.Exp, exp)
    .column(cols.Input, JSON.stringify(input))
    .column(cols.CreatedAt, ValueToken.Now)
    .column(cols.Status, JobStatus.Pending)
    .build();
  const stmt = db.prepare(source);
  return stmt.get(params) as { id: number };
}

export function updateOutput(db: Database, i: InputUpdateJobOutput) {
  const cols = Column.Job;
  const { source, params } = update_table(Table.Job)
    .where(Eq(cols.Id, i.id))
    .column(cols.Status, 'FINISHED')
    .column(cols.Output, JSON.stringify(i.output))
    .column(cols.FinishedAt, ValueToken.Now)
    .build();
  const stms = db.prepare(source);
  return stms.run(params);
}

export function updateError(db: Database, i: InputUpdateJobError) {
  const cols = Column.Job;
  const { source, params } = update_table(Table.Job)
    .where(Eq(cols.Id, i.id))
    .column(cols.Status, 'FINISHED')
    .column(cols.Error, i.error)
    .column(cols.FinishedAt, ValueToken.Now)
    .build();
  const stms = db.prepare(source);
  return stms.run(params);
}

export function deleteMany(db: Database, input: InputDeleteManyJobs) {
  const cols = Column.Job;
  const { source } = delete_from(Table.Job).where(Eq(cols.Id, '__not-used')).build();
  const stmt = db.prepare(source);
  const transact = db.transaction(() => input.ids.map((id) => stmt.run([id])));
  transact();
}
