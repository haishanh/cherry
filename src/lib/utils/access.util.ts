const publicEndpoints = [
  '/login',
  '/join',
  '/style',
  '/api/ping',
  { type: 'startsWith', value: '/api/auth/' },
  { type: 'startsWith', value: '/error/' },
];
const protectedEndpoints = ['/', '/search', '/settings'];

function match(arr: typeof publicEndpoints, url: URL) {
  const pathname = url.pathname;
  for (const r of arr) {
    if (typeof r === 'string') {
      if (r === pathname) return true;
    } else if (r.type === 'startsWith' && pathname.startsWith(r.value)) {
      return true;
    }
  }
  return false;
}

export const isPublic = (url: URL) => match(publicEndpoints, url);
export const isProtected = (url: URL) => match(protectedEndpoints, url);
