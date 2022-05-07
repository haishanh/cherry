import type { RequestHandler } from '@sveltejs/kit';
import * as dbUtil from '$lib/server/sqlite.util';
import { parser } from 'html-metadata-parser';
// {
//    "meta": {
//       "title": "Is .css a bad idea? Is inlining the way forward? | HTTP 203",
//       "url": "https://www.youtube.com/watch?v=3sMflOp5kiQ",
//       "description": "Ada (from Samsung Internet) and Jake (not from Samsung Internet) chat about issues with managing CSS, and whether external resources make it harder to build ..."
//    },
//    "og": {
//       "site_name": "YouTube",
//       "url": "https://www.youtube.com/watch?v=3sMflOp5kiQ",
//       "title": "Is .css a bad idea? Is inlining the way forward? | HTTP 203",
//       "image": "https://i.ytimg.com/vi/3sMflOp5kiQ/maxresdefault.jpg",
//       "description": "Ada (from Samsung Internet) and Jake (not from Samsung Internet) chat about issues with managing CSS, and whether external resources make it harder to build ...",
//       "type": "video.other"
//    },
//    "images": []
// }

async function fetchMeta(url: string) {
  const result = await parser(url);
  return {
    url,
    title: result.og?.title || result.meta?.title || '',
    desc: result.og?.description || result.meta?.description || '',
  };
}

async function createRecords() {
  const urls = [
    // 'https://www.youtube.com/watch?v=3sMflOp5kiQ',
    // 'https://github.com/miniflux/v2/blob/master/database/migrations.go',
    // 'https://twitter.com/SenderWallet/status/1521873048793722880',
    'https://twitter.com/kucoincom/status/1521165116007460878?s=12&t=ZOu1LWiFJMvTNgpO3locjQ',
    'https://www.reddit.com/r/vimporn/comments/tiqxdn/same_thing_we_do_everyday_pinky/?utm_source=share&utm_medium=ios_app&utm_name=iossmf',
    'https://www.reddit.com/r/selfhosted/comments/tjx927/my_dockercompose_collection/',
    'https://nova.moe/accelerate-multi-arch-build-on-github-actions/',
    'https://www.reddit.com/r/typescript/comments/udxyqk/typescript_tips_tricks_w_matt_pocock/?utm_source=share&utm_medium=ios_app&utm_name=iossmf',
    'https://www.collaborativefund.com/blog/casualties-of-your-own-success/',
    'https://twitter.com/finance_ref/status/1518913810345693184?s=12&t=gi8V-xePKScRmXAhdDXZmA',
    'https://tympanus.net/codrops/collective/collective-708/',
    'https://github.com/darlal/obsidian-switcher-plus/pull/41',
    'https://www.reddit.com/r/neovim/comments/u721h3/how_can_i_find_the_source_of_highlighting/?utm_source=share&utm_medium=ios_app&utm_name=iossmf',
    'https://github.com/hotoo/pinyin',
    'http://ishadeed.com/article/object-fit-background-size-css/',
    'https://www.appinn.com/townscaper-online/',
    'https://www.youtube.com/watch?v=6cvRBsg6HfM',
    'https://www.surnamemap.eu/',
    'https://bam.kalzumeus.com/archive/moving-money-internationally/',
    'https://twitter.com/sandraaleow/status/1490348328038506496',
    'https://speedrunethereum.com/',
    'https://twitter.com/0xngmi/status/1498132477579350017?s=12',
    'https://github.com/welai/glow-sans',
    'https://www.clearrivergames.com/2022/02/16/the-classic-arcade-game-is-back-in-a-modern-version-snow-bros-special-comes-to-nintendo-switch-later-this-year/',
    'https://dribbble.com/shots/17426720-Benkei-Financial-dashboard',
  ];

  const ids: number[] = [];
  for (const url of urls) {
    const result = await fetchMeta(url);
    const x = dbUtil.bookmark.create(1, result);
    ids.push(x.data.id);
  }
  return ids;
}

export const get: RequestHandler = async () => {
  const ret = await createRecords();
  return { status: 201, body: ret };
};
