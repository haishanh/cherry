export class RequestError {
  constructor(
    public readonly error: any | null,
    public readonly response: Response | null,
    public readonly body: any = null,
  ) {}
}

export async function request(config: { method?: string; url: string; data?: any; headers?: Record<string, any> }) {
  const method = config.method || 'GET';
  const url = config.url;
  const headers = config.headers || {};

  let res: Response;
  const init: RequestInit = { method, headers };
  if (config.data) {
    if (config.data instanceof File) {
      init.body = config.data;
    } else if (!(config.data instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
      init.body = JSON.stringify(config.data);
    } else {
      init.body = config.data;
    }
  }
  try {
    res = await fetch(url, init);
  } catch (e) {
    throw new RequestError(e, null);
  }

  let json: any;

  try {
    json = await res.json();
  } catch (e) {
    // ignore
  }

  if (!res.ok) {
    console.log(`${method} ${url} response body`);
    console.log(JSON.stringify(json, null, 2));
    throw new RequestError(null, res, json);
  }

  return { status: res.status, data: json, res };
}
