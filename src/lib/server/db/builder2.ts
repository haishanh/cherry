import type { ColumnItem, TableItem } from './identifier';

export enum OrderByDir {
  Ascending = 'ASC',
  Descending = 'DESC',
}

type WhereExpr =
  | { type: 'Eq'; col: ColumnItem; placeholder: string }
  | { type: 'Is'; col: ColumnItem; placeholder: string }
  | { type: 'Lte'; col: ColumnItem[]; placeholder: string[] };

export const Eq: (col: ColumnItem, placeholder: string) => WhereExpr = (col, placeholder) => {
  return { type: 'Eq', col, placeholder };
};

export const Is: (col: ColumnItem, placeholder: string) => WhereExpr = (col, placeholder) => {
  return { type: 'Is', col, placeholder };
};

export const Lte: (col: ColumnItem[], placeholder: string[]) => WhereExpr = (col, placeholder) => {
  return { type: 'Lte', col, placeholder };
};

type OrderBy = { col: ColumnItem; dir?: OrderByDir } | string;

export class SelectFrom {
  private tokens: {
    from?: TableItem;
    select?: ColumnItem[];
    join?: { col0: ColumnItem; col1: ColumnItem }[];
    where?: WhereExpr[];
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
    let joins: string[];

    // table alias lookup
    const tableLookup = new Map<TableItem, string>();
    tableLookup.set(tokens.from, 't0');
    const from = `${tokens.from.name} t0`;

    if (tokens.join) {
      let count = 1;
      joins = tokens.join.map(({ col0, col1 }) => {
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

    const where = tokens.where
      .map(({ type, col, placeholder }) => {
        switch (type) {
          case 'Eq':
            return `${this.printCol(col, tableLookup)} = ${placeholder}`;
          case 'Is':
            return `${this.printCol(col, tableLookup)} IS ${placeholder}`;
          case 'Lte': {
            const lhs = col.map((c) => this.printCol(c, tableLookup)).join(',');
            const rhs = placeholder.join(',');
            return `(${lhs}) <= (${rhs})`;
          }
          default:
            throw new Error(`type=${type} not supported`);
        }
      })
      .join(' AND ');

    const select = tokens.select.map((col) => this.printCol(col, tableLookup)).join(',');

    const orderBy = this.printOrderBy(tokens.orderBy, tableLookup);

    return [
      `SELECT ${select} FROM ${from}`,
      joins ? joins.map((j) => `JOIN ${j}`).join(' ') : false,
      where ? `WHERE ${where}` : false,
      orderBy ? `ORDER BY ${orderBy}` : false,
      tokens.limit ? `LIMIT ${tokens.limit}` : false,
      tokens.offset ? `OFFSET ${tokens.offset}` : false,
    ]
      .filter((x) => !!x)
      .join(' ');
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
