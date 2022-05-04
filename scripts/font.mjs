import fetch from 'node-fetch';
import fs from 'fs';
import util from 'util';
import { pipeline as pipeline0 } from 'stream';

const pipeline = util.promisify(pipeline0);

const dstBase = './src/assets';

// https://rsms.me/inter/inter.css
const interFontUrl = {
  // 400
  regular: {
    woff2: { url: 'https://rsms.me/inter/font-files/Inter-Regular.woff2?v=3.19', filename: `${dstBase}/interJD5f6rvu` },
    woff: { url: 'https://rsms.me/inter/font-files/Inter-Regular.woff?v=3.19', filename: `${dstBase}/interJD5f6rvu` },
  },
  // 800
  extraBold: {
    woff2: {
      url: 'https://rsms.me/inter/font-files/Inter-ExtraBold.woff2?v=3.19',
      filename: `${dstBase}/interIoAYgYqv`,
    },
    woff: { url: 'https://rsms.me/inter/font-files/Inter-ExtraBold.woff?v=3.19', filename: `${dstBase}/interIoAYgYqv` },
  },
};

async function download(url, name, ext) {
  const res = await fetch(url);
  const ws = fs.createWriteStream(`${name}.${ext}`);
  await pipeline(res.body, ws);
}

(async () => {
  const works = [];
  for (let weight in interFontUrl) {
    for (let ft in interFontUrl[weight]) {
      const x = interFontUrl[weight][ft];
      works.push(download(x.url, x.filename, ft));
    }
  }
  await Promise.all(works);
})();
