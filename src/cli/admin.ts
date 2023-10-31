class Fetcher {
  headers = new Headers({ 'content-type': 'application/json' });
  constructor(private base = 'http://localhost:5173') {}
  req(uri: string, opts: { method: string; body: any }) {
    return fetch(this.base + uri, {
      method: opts.method,
      headers: this.headers,
      ...(opts.body ? { body: JSON.stringify(opts.body) } : undefined),
    });
  }
  post(uri: string, body: any) {
    return this.req(uri, { method: 'POST', body });
  }
}

async function report(res: Response) {
  if (res.ok) {
    console.log('SUCCESS');
    try {
      console.log(await res.json());
    } catch (e) {
      // ignore
    }
  } else {
    console.log('ERROR');
    console.log('status', res.status);
    for (const entry of res.headers) {
      console.log(`${entry[0]}: ${entry[1]}`);
    }
    console.log(await res.json());
    process.exit(1);
  }
}

export async function create_user(username: string, password: string, options: { admin: boolean }) {
  const f0 = new Fetcher('http://localhost:5173/api/_internal');
  const res = await f0.post('/create-user', { username, password, options });
  await report(res);
}

export async function set_admin(username: string) {
  const f0 = new Fetcher('http://localhost:5173/api/_internal');
  const res = await f0.post('/set-admin', { username });
  await report(res);
}

export async function unset_admin(username: string) {
  const f0 = new Fetcher('http://localhost:5173/api/_internal');
  const res = await f0.post('/unset-admin', { username });
  await report(res);
}

export async function migration(to: string) {
  const f0 = new Fetcher('http://localhost:5173/api/_internal');
  const res = await f0.post('/migration', { to });
  await report(res);
}

export async function delete_user(id: string, username: string) {
  const f0 = new Fetcher('http://localhost:5173/api/_internal');
  const res = await f0.post('/delete-user', { id, username });
  await report(res);
}

export async function update_user_password(username: string, newPassword: string) {
  const f0 = new Fetcher('http://localhost:5173/api/_internal');
  const res = await f0.post('/update-user-password', { username, newPassword });
  await report(res);
}
