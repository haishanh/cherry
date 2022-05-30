export function parseCookie(cookie: string) {
  if (!cookie) return {};

  const ret: Record<string, string> = {};
  const segments = cookie.split(';');
  segments.forEach((segment) => {
    const parts = segment.trim().split('=');
    ret[parts[0]] = parts[1];
  });
  return ret;
}

export function gen(key: string, value: string, opts: { maxAge?: number; secure?: boolean } = {}) {
  const secure = opts.secure !== false;
  let str = key + '=' + value;
  if (secure) str += '; Secure';
  str += '; Path=/; SameSite=Lax';
  if (typeof opts.maxAge === 'number') str += '; Max-Age=' + opts.maxAge;
  str += '; HttpOnly';
  return str;
}
