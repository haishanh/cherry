export type Backend = {
  apiBase: string;
  pat: string;
};

export function coalesceBase(b?: Backend) {
  return b && b.apiBase ? b.apiBase : '';
}

export function genAuthHeader(b?: Backend) {
  return {
    ...(b && b.pat ? { Authorization: `Bearer ${b.pat}` } : undefined),
  };
}
