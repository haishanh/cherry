const publicEndpoints = [
  '/signin',
  '/signup',
  '/api/ping',
  { type: 'startsWith', value: '/api/favicon/' },
  { type: 'startsWith', value: '/_play' },
  { type: 'startsWith', value: '/api/auth/' },
  { type: 'startsWith', value: '/api/public/' },
  // _internal endpoints are regarded as public endpoints
  // since they are not exposed via Nginx
  { type: 'startsWith', value: '/api/_internal/' },
  { type: 'startsWith', value: '/error/' },
];
const protectedEndpoints = [
  '/',
  '/tags',
  '/groups',
  { type: 'startsWith', value: '/edit' },
  { type: 'startsWith', value: '/settings' },
  { type: 'startsWith', value: '/api/bookmarks' },
  { type: 'startsWith', value: '/api/import' },
  { type: 'startsWith', value: '/api/search' },
  { type: 'startsWith', value: '/api/tags' },
  { type: 'startsWith', value: '/api/groups' },
  { type: 'startsWith', value: '/api/user' },
  { type: 'startsWith', value: '/api/test' },
];

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
export const isProtected = (url: URL) => !match(publicEndpoints, url) && match(protectedEndpoints, url);
