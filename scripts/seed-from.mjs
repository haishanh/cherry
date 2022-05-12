import assert from 'assert';
import fetch from 'node-fetch';

const env = process.env;

function makeAuthHeader(apiKey) {
  return { Authorization: `Bearer ${apiKey}` };
}

async function seedSiteToSite() {
  const src = { apiBaseUrl: env.SRC_BASE_URL, apiKey: env.SRC_API_KEY };
  const dst = { apiBaseUrl: env.DST_BASE_URL, apiKey: env.DST_API_KEY };

  assert(src.apiBaseUrl, 'SRC_BASE_URL must be provided');
  assert(src.apiKey, 'SRC_API_KEY must be provided');
  assert(dst.apiBaseUrl, 'DST_BASE_URL must be provided');
  assert(dst.apiKey, 'DST_API_KEY must be provided');

  return await fetch(src.apiBaseUrl + '/api/bookmarks', {
    headers: makeAuthHeader(src.apiKey),
  }).then((items) => {
    console.log('find', items.length, 'items');
    const jobs = items.map((item) => {
      return fetch(dst.apiBaseUrl + '/api/bookmarks', {
        method: 'POST',
        headers: makeAuthHeader(dst.apiKey),
        body: JSON.stringify({
          url: item.url,
          title: item.title,
          desc: item.desc,
        }),
      });
    });
    return Promise.all(jobs);
  });
}

async function seedDbToSite() {
  const dst = { apiBaseUrl: env.DST_BASE_URL, apiKey: env.DST_API_KEY };

  assert(env.SRC_DB_FILE, 'SRC_DB_FILE must be provided');
  assert(dst.apiBaseUrl, 'DST_BASE_URL must be provided');
  assert(dst.apiKey, 'DST_API_KEY must be provided');

  const mod = await import('better-sqlite3');
  const Database = mod.default;
  const db = new Database(env.SRC_DB_FILE);
  const rows = db.prepare('select * from bookmark').all();
  const jobs = rows.map((item) => {
    return fetch(dst.apiBaseUrl + '/api/bookmarks', {
      method: 'POST',
      headers: makeAuthHeader(dst.apiKey),
      body: JSON.stringify({
        url: item.url,
        title: item.title,
        desc: item.desc,
      }),
    });
  });
  return Promise.all(jobs);
}

(async () => {
  await seedDbToSite();
})();
