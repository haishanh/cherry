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
