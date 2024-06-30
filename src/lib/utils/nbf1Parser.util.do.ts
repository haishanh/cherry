import { readFile } from 'fs/promises';

import { Parser as NetscapeBookmarkFile1Parser } from './nbf1Parser.util';

function parseNetscapeBookmarkFile1(html: string) {
  const map = new Map();
  new NetscapeBookmarkFile1Parser(html, (b) => {
    if (map.has(b.group)) {
      map.get(b.group).push(b);
    } else {
      map.set(b.group, [b]);
    }
  }).parse();
  for (const e of map) {
    console.log(JSON.stringify(e[0], null, 2));
    console.log(JSON.stringify(e[1], null, 2));
  }
}

(async () => {
  const f0 = process.env.INPUT_FILE;
  if (!f0) {
    console.log('Require env var INPUT_FILE');
    process.exit(1);
  }
  const cnt0 = await readFile(f0, 'utf8');
  parseNetscapeBookmarkFile1(cnt0);
})();
