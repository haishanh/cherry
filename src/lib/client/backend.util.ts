export type Backend = {
  apiBase: string;
  pat: string;
};

export function coalesceBase(b: Backend | null) {
  return b && b.apiBase ? b.apiBase : '';
}

export function genAuthHeader(b: Backend | null) {
  return {
    ...(b && b.pat ? { Authorization: `Bearer ${b.pat}` } : undefined),
  };
}
