import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const port = process.env.CHERRY_E2E_PORT || '4187';
if (!/^\d+$/.test(port) || Number(port) < 1024 || Number(port) > 65535) {
  throw new Error('CHERRY_E2E_PORT must be an integer between 1024 and 65535.');
}

// Never use a developer's DATABASE_PATH, DATA_DIR, JWT, proxy authentication, or
// OAuth settings. Each run owns its data, even when a local .env file is present.
const dataDir = await mkdtemp(path.join(tmpdir(), 'cherry-e2e-'));
console.log(`E2E data directory: ${dataDir}`);
const child = spawn(process.execPath, ['build/index.js'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    HOST: '127.0.0.1',
    PORT: port,
    SOCKET_PATH: '',
    // The production adapter defaults to HTTPS. Playwright acts as the trusted
    // loopback proxy and supplies this header for our HTTP-only test server.
    PROTOCOL_HEADER: 'x-forwarded-proto',
    HOST_HEADER: '',
    PORT_HEADER: '',
    ADDRESS_HEADER: '',
    LISTEN_PID: '0',
    LISTEN_FDS: '0',
    DATABASE_PATH: path.join(dataDir, 'cherry.sqlite'),
    DATA_DIR: dataDir,
    JWT_SECRET: randomBytes(32).toString('hex'),
    ENABLE_PUBLIC_REGISTRATION: '1',
    USE_INSECURE_COOKIE: '1',
    ENABLE_HTTP_REMOTE_USER: '0',
    GOOGLE_OAUTH_CLIENT_ID: '',
    GOOGLE_OAUTH_CLIENT_SECRET: '',
    GOOGLE_OAUTH_REDIRECT_URI: '',
    HTTP_PROXY: '',
    http_proxy: '',
    LOG_LEVEL: 'error',
    BODY_SIZE_LIMIT: String(50 * 1024 * 1024),
  },
});

let stopping = false;
for (const signal of ['SIGTERM', 'SIGINT']) {
  process.once(signal, () => {
    stopping = true;
    child.kill(signal);
  });
}

child.once('error', async (error) => {
  console.error(error);
  await rm(dataDir, { recursive: true, force: true });
  process.exitCode = 1;
});
child.once('exit', async (code) => {
  await rm(dataDir, { recursive: true, force: true });
  process.exitCode = stopping ? 0 : (code ?? 1);
});
