import assert from 'node:assert';

import type { ColumnItem, TableItem } from './identifier';

export const ValueToken = {
  // the content of the value doesn't matter
  Now: { $debug: 'ValueToken:Now' },
};

export enum OrderByDir {
  Ascending = 'ASC',
  Descending = 'DESC',
}

type WhereExpr =
  | { type: 'Eq'; col: ColumnItem; val: unknown }
  | { type: 'Is'; col: ColumnItem; val: unknown }
  | { type: 'Lte'; col: ColumnItem[]; val: unknown[] }
  | { type: 'Match'; col: ColumnItem; val: unknown };

export const Eq: (col: ColumnItem, val: unknown) => WhereExpr = (col, val) => {
  return { type: 'Eq', col, val: val };
};

export const Is: (col: ColumnItem, val: unknown) => WhereExpr = (col, val) => {
  return { type: 'Is', col, val: val };
};

export const Lte: (col: ColumnItem[], val: unknown[]) => WhereExpr = (col, val) => {
  return { type: 'Lte', col, val: val };
};

export const Match: (col: ColumnItem, val: unknown) => WhereExpr = (col, val) => {
  return { type: 'Match', col, val: val };
};

type OrderBy = { col: ColumnItem; dir?: OrderByDir } | string;

export class SelectFrom {
  private tokens: {
    from?: TableItem;
    select: ColumnItem[];
    join?: { col0: ColumnItem; col1: ColumnItem }[];
    where: WhereExpr[];
    orderBy?: OrderBy[];
    limit?: number;
    offset?: number;
  } = {
    select: [],
    where: [],
  };
  constructor(from: TableItem, select: ColumnItem | ColumnItem[]) {
    this.from(from);
    this.select(select);
    return this;
  }
  public from(table: TableItem) {
    this.tokens.from = table;
    return this;
  }
  public select(column: ColumnItem | ColumnItem[]) {
    if (Array.isArray(column)) {
      this.tokens.select.push(...column);
    } else {
      this.tokens.select.push(column);
    }
    return this;
  }
  public join(col0: ColumnItem, col1: ColumnItem) {
    if (!this.tokens.join) {
      this.tokens.join = [{ col0, col1 }];
    } else {
      this.tokens.join.push({ col0, col1 });
    }
    return this;
  }
  public where(input: WhereExpr | WhereExpr[]) {
    if (Array.isArray(input)) {
      this.tokens.where.push(...input);
    } else {
      this.tokens.where.push(input);
    }
    return this;
  }
  public orderBy(col: ColumnItem | string, dir?: OrderByDir) {
    const item = typeof col === 'string' ? col : { col, dir };
    if (!this.tokens.orderBy) {
      this.tokens.orderBy = [item];
    } else {
      this.tokens.orderBy.push(item);
    }
    return this;
  }
  public limit(n: number) {
    this.tokens.limit = n;
    return this;
  }
  public offset(n: number) {
    this.tokens.offset = n;
    return this;
  }
  public build() {
    const tokens = this.tokens;
    let joins: string[] = [];

    // table alias lookup
    const tableLookup = new Map<TableItem, string>();
    assert(tokens.from);
    tableLookup.set(tokens.from, 't0');
    const from = `${tokens.from.name} t0`;

    if (tokens.join) {
      let count = 1;
      joins = tokens.join.map(({ col0, col1 }) => {
        assert(col1.table);
        // join bookmark_fts fts on fts.rowid = b.id
        // TODO check item.col0.table === tokens.from in dev?
        let t1 = tableLookup.get(col1.table);
        if (!t1) {
          t1 = 't' + count++;
          tableLookup.set(col1.table, t1);
        }
        return `${col1.table.name} ${t1} ON t0.${col0.name} = ${t1}.${col1.name}`;
      });
    }

    const params: unknown[] = [];
    const where = tokens.where
      .map(({ type, col, val: placeholder }) => {
        switch (type) {
          case 'Eq':
            params.push(placeholder);
            return `${this.printCol(col, tableLookup)} = ?`;
          case 'Is':
            params.push(placeholder);
            return `${this.printCol(col, tableLookup)} IS ?`;
          case 'Match':
            params.push(placeholder);
            return `${this.printCol(col, tableLookup)} match ?`;
          case 'Lte': {
            const lhs = col.map((c) => this.printCol(c, tableLookup)).join(',');
            placeholder.forEach((p) => params.push(p));
            const rhs = placeholder.map(() => '?').join(',');
            return `(${lhs}) <= (${rhs})`;
          }
          default:
            throw new Error(`type=${type} not supported`);
        }
      })
      .join(' AND ');

    const select = tokens.select.map((col) => this.printCol(col, tableLookup)).join(',');

    const orderBy = this.printOrderBy(tokens.orderBy, tableLookup);

    const source = [
      `SELECT ${select} FROM ${from}`,
      joins && joins.length > 0 ? joins.map((j) => `JOIN ${j}`).join(' ') : false,
      where ? `WHERE ${where}` : false,
      orderBy ? `ORDER BY ${orderBy}` : false,
      tokens.limit ? `LIMIT ${tokens.limit}` : false,
      tokens.offset ? `OFFSET ${tokens.offset}` : false,
    ]
      .filter((x) => !!x)
      .join(' ');
    return { source, params };
  }

  private printCol(col: ColumnItem, tableLookup: Map<TableItem, string>) {
    const alias = col.table && tableLookup.get(col.table);
    return alias ? alias + '.' + col.name : col.name;
  }

  private printOrderBy(obs: OrderBy[] | undefined, tableLookup: Map<TableItem, string>) {
    if (!obs) return '';
    return obs
      .map((ob) => {
        if (typeof ob === 'string') return ob;
        return `${this.printCol(ob.col, tableLookup)}${ob.dir ? ' ' + ob.dir : ''}`;
      })
      .join(',');
  }
}

export const select_from = (from: TableItem, select: ColumnItem | ColumnItem[]) => {
  return new SelectFrom(from, select);
};

class InsertInto {
  private tokens: {
    table?: TableItem;
    columns: Array<{
      col: ColumnItem;
      val: unknown;
    }>;
  } = {
    columns: [],
  };

  constructor(table: TableItem) {
    this.tokens.table = table;
    return this;
  }

  column(col: ColumnItem, val: unknown) {
    this.tokens.columns.push({ col, val });
    return this;
  }

  build() {
    assert(this.tokens.table, 'Must supply the table');
    assert(
      this.tokens.columns.every((col) => col.col.table === this.tokens.table),
      'One of the column does not belong to the table',
    );
    const fields: string[] = [];
    this.tokens.columns.forEach((col) => {
      fields.push(col.col.name);
    });
    const values: string[] = [];
    const params: unknown[] = [];
    this.tokens.columns.forEach((col) => {
      if (col.val === ValueToken.Now) {
        values.push("strftime('%s','now')");
      } else {
        values.push('?');
        params.push(col.val);
      }
    });
    const source = `insert into ${this.tokens.table.name} (${fields.join(',')}) values (${values.join(
      ',',
    )}) returning *`;
    return { source, params };
  }
}

export const insert_into = (t: TableItem) => {
  return new InsertInto(t);
};

class UpdateTable {
  private tokens: {
    table?: TableItem;
    columns: Array<{
      col: ColumnItem;
      val: unknown;
    }>;
    where: WhereExpr[];
  } = {
    columns: [],
    where: [],
  };
  constructor(table: TableItem) {
    this.tokens.table = table;
    return this;
  }

  column(col: ColumnItem, val: unknown) {
    this.tokens.columns.push({ col, val });
    return this;
  }

  where(input: WhereExpr | WhereExpr[]) {
    if (Array.isArray(input)) {
      this.tokens.where.push(...input);
    } else {
      this.tokens.where.push(input);
    }
    return this;
  }

  build() {
    assert(this.tokens.table, 'Must supply the table');
    assert(
      this.tokens.columns.every((col) => col.col.table === this.tokens.table),
      'One of the column does not belong to the table',
    );
    const updates: string[] = [];
    const params: unknown[] = [];
    this.tokens.columns.forEach((col) => {
      if (col.val === ValueToken.Now) {
        updates.push(`${col.col.name} = strftime('%s','now')`);
      } else {
        updates.push(`${col.col.name} = ?`);
        params.push(col.val);
      }
    });
    const where = this.tokens.where
      .map(({ type, col, val }) => {
        switch (type) {
          case 'Eq':
            params.push(val);
            return `${col.name} = ?`;
          case 'Is':
            params.push(val);
            return `${col.name} IS ?`;
          case 'Match':
            params.push(val);
            return `${col.name} match ?`;
          case 'Lte': {
            const lhs = col.map((c) => c.name).join(',');
            const rhs = val.map(() => '?').join(',');
            val.forEach((p) => params.push(p));
            // params.push(val);
            return `(${lhs}) <= (${rhs})`;
          }
          default:
            throw new Error(`type=${type} not supported`);
        }
      })
      .join(' AND ');

    const source = [`update ${this.tokens.table.name} set ${updates.join(', ')}`, where ? `WHERE ${where}` : false]
      .filter((x) => !!x)
      .join(' ');

    return { source, params };
  }
}

export const update_table = (t: TableItem) => {
  return new UpdateTable(t);
};

class DeleteFrom {
  private tokens: {
    table?: TableItem;
    where: WhereExpr[];
  } = {
    where: [],
  };
  constructor(table: TableItem) {
    this.tokens.table = table;
    return this;
  }

  where(input: WhereExpr | WhereExpr[]) {
    if (Array.isArray(input)) {
      this.tokens.where.push(...input);
    } else {
      this.tokens.where.push(input);
    }
    return this;
  }

  build() {
    assert(this.tokens.table, 'Must supply table');
    assert(this.tokens.where, 'Must supply where');
    const params: unknown[] = [];
    const where = this.tokens.where
      .map(({ type, col, val }) => {
        switch (type) {
          case 'Eq':
            params.push(val);
            return `${col.name} = ?`;
          case 'Is':
            params.push(val);
            return `${col.name} IS ?`;
          case 'Match':
            params.push(val);
            return `${col.name} match ?`;
          case 'Lte': {
            const lhs = col.map((c) => c.name).join(',');
            const rhs = val.map(() => '?').join(',');
            val.forEach((p) => params.push(p));
            // params.push(val);
            return `(${lhs}) <= (${rhs})`;
          }
          default:
            throw new Error(`type=${type} not supported`);
        }
      })
      .join(' AND ');

    const source = [`delete from ${this.tokens.table.name}`, where ? `WHERE ${where}` : false]
      .filter((x) => !!x)
      .join(' ');

    return { source, params };
  }
}

export const delete_from = (t: TableItem) => {
  return new DeleteFrom(t);
};
