import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';

import * as tar from 'tar';

const VERSION = '0.2.2';
const TARGETS = {
  'darwin:arm64': {
    archive: `signal-tokenizer-v${VERSION}-aarch64-apple-darwin.tar.gz`,
    library: 'libsignal_tokenizer.dylib',
  },
  'linux:arm64': {
    archive: `signal-tokenizer-v${VERSION}-aarch64-unknown-linux-gnu.tar.gz`,
    library: 'libsignal_tokenizer.so',
  },
  'linux:x64': {
    archive: `signal-tokenizer-v${VERSION}-x86_64-unknown-linux-gnu.tar.gz`,
    library: 'libsignal_tokenizer.so',
  },
};

const target = TARGETS[`${process.platform}:${process.arch}`];

if (!target) {
  console.error(
    `No prebuilt signal_tokenizer release for ${process.platform}/${process.arch}. Build haishanh/Signal-FTS5-Extension from source and copy the resulting library into db/.`,
  );
  process.exit(1);
}

const repoRoot = process.cwd();
const dbDir = path.join(repoRoot, 'db');
const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'signal-tokenizer-'));
const archivePath = path.join(tempDir, target.archive);
const extractDir = path.join(tempDir, 'extract');
const downloadUrl = `https://github.com/haishanh/Signal-FTS5-Extension/releases/download/v${VERSION}/${target.archive}`;

try {
  const response = await fetch(downloadUrl);
  if (!response.ok || !response.body) {
    throw new Error(`Download failed with ${response.status} ${response.statusText}`);
  }

  await fs.mkdir(dbDir, { recursive: true });
  await pipeline(response.body, await fs.open(archivePath, 'w').then((file) => file.createWriteStream()));

  await fs.mkdir(extractDir, { recursive: true });
  await tar.x({
    file: archivePath,
    cwd: extractDir,
  });

  const libraryPath = await findFile(extractDir, target.library);
  if (!libraryPath) {
    console.error(
      `Downloaded ${target.archive}, but ${target.library} was not found. Build haishanh/Signal-FTS5-Extension from source and copy the library into db/.`,
    );
    process.exit(1);
  }

  const destination = path.join(dbDir, target.library);
  await fs.copyFile(libraryPath, destination);
  console.log(`Saved ${target.library} to ${destination}`);
} finally {
  await fs.rm(tempDir, { recursive: true, force: true });
}

async function findFile(dir, filename) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isFile() && entry.name === filename) return entryPath;
    if (entry.isDirectory()) {
      const nested = await findFile(entryPath, filename);
      if (nested) return nested;
    }
  }
  return null;
}
