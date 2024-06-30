type Tokens = {
  select: string;
  from: string;
  join?: string | string[];
  where?: string | string[];
  orderBy?: string;
  limit?: number;
  offset?: number;
  with?: { table: string; as: { tokens: Tokens; params: Params } };
};
type Params = any[];

export function buildSelect({ tokens, params }: { tokens: Tokens; params: Params }, opts?: { level?: number }) {
  const { select, from, join, where, orderBy, limit, offset, with: with0 } = tokens;
  let p = [...params];
  let sub: { query: string; params: any[] };

  // level decides indentations
  const level = opts?.level || 0;
  const space = makeSpace(level * 2);

  const q: string = [
    with0
      ? ((sub = buildSelect(with0.as, { level: level + 1 })),
        (p = [...sub.params, ...p]),
        `WITH ${with0.table} AS (${sub.query})`)
      : false,
    `SELECT ${select}`,
    `FROM ${from}`,
    join ? (Array.isArray(join) ? join.map((j) => `JOIN ${j}`).join(`\n${space}`) : `JOIN ${join}`) : false,
    where ? (Array.isArray(where) ? `WHERE ${where.join(' AND ')}` : `WHERE ${where}`) : false,
    orderBy ? `ORDER BY ${orderBy}` : false,
    limit ? `LIMIT ${limit}` : false,
    offset ? `OFFSET ${offset}` : false,
  ]
    .filter((x) => !!x)
    .join(`\n${space}`);

  return { query: q, params: p };
}

export const table = {
  create: (input: { name: string; ifNotExists: boolean; column: Record<string, string>; constraints?: string[] }) => {
    const { name, ifNotExists, column } = input;
    const constraints = input.constraints || [];
    const columnKeys = Object.keys(column);
    const colStr = columnKeys.map((k) => `${k} ${column[k]}`).join(',');
    const constraintStr = constraints.length > 0 ? ',' + constraints.join(',') : '';
    return `create table ${ifNotExists ? 'if not exists' : ''} ${name} (${colStr}${constraintStr})`;
  },
};

export const index = {
  create: (input: { name: string; ifNotExists: boolean; table: string; columns: string[] }) => {
    const { name, ifNotExists, table, columns } = input;
    return `create index ${ifNotExists ? 'if not exists' : ''} ${name} on ${table} (${columns.join(',')})`;
  },
};

export const trigger = {
  create: (input: { name: string; ifNotExists: boolean; event: string; table: string; statements: string[] }) => {
    const { name, ifNotExists, event, table, statements } = input;

    return `create trigger ${ifNotExists ? 'if not exists' : ''} ${name} ${event} on ${table} begin\n${statements.join(
      ';\n',
    )};\nend`;
  },
};

function makeSpace(n: number) {
  let s = '';
  for (let i = 0; i < n; i++) {
    s = s + ' ';
  }
  return s;
}
