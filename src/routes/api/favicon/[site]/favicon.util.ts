import type { Element } from 'domhandler';
import * as htmlparser2 from 'htmlparser2';
import { fetch, ProxyAgent } from 'undici';
import { fileTypeFromBuffer } from 'file-type';
import { HTTP_PROXY } from '$lib/env';
import { logger } from '$lib/server/logger';

import * as datauriUtil from './datauri.util';

const TIMEOUT = 5000;

// prettier-ignore
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';

const fetchInit = {
  ...(process.env.NODE_ENV === 'development' && HTTP_PROXY?.startsWith('http')
    ? { dispatcher: new ProxyAgent(HTTP_PROXY) }
    : undefined),
};

function makeAbsUrl(prefix: string, uri: string) {
  if (uri.startsWith('https://') || uri.startsWith('http://')) return uri;
  if (uri.startsWith('//')) return `https:${uri}`;
  return prefix + (uri.startsWith('/') ? uri : `/${uri}`);
}

async function request(site: string): Promise<{ html: string; base: string }> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 6000);
  const res = await fetch(site, {
    ...fetchInit,
    signal: controller.signal,
    headers: { Accept: 'text/html,application/xhtml+xml,application/xml', 'User-Agent': UA },
  });
  clearTimeout(id);

  if (res.status > 299 && res.status < 400) {
    const loc = res.headers.get('location');
    if (loc) {
      const url = makeAbsUrl(site, loc);
      console.log(`got status ${res.status} new url=${url}`);
      return await request(url);
    }
  }

  const html = await res.text();
  return { html, base: site };
}

const commonLinkRelIconAttrs = ['data-react-helmet', 'data-rh', 'crossorigin'];

function printUnknownLinkRelIconAttrs(props: Record<string, any>, site: string) {
  const keys = Object.keys(props);
  const unknownAttr: typeof props = {};
  let hasUnkownAttr = false;
  for (const k of keys) {
    if (commonLinkRelIconAttrs.indexOf(k) < 0) {
      hasUnkownAttr = true;
      unknownAttr[k] = props[k];
    }
  }
  if (hasUnkownAttr) logger.debug('site=%s unknown link[rel=icon] attributes %o', site, unknownAttr);
}

function magicSort<T extends { width?: number; mask?: boolean }>(items: T[]) {
  // if both have "width" sort them from small to big
  // items without "width" are the "biggest"
  items.sort((a, b) => {
    if (typeof a.width !== 'number') return 1;
    if (typeof b.width !== 'number') return -1;
    return a.width - b.width;
  });

  // put item with mask to the end of the array
  const items0: T[] = [];
  const items1: T[] = [];
  for (const item of items) {
    if (item.mask) {
      items1.push(item);
    } else {
      items0.push(item);
    }
  }
  for (const item of items1) {
    items0.push(item);
  }
  return items0;
}

export function findIconRelLinks(html: string) {
  const dom = htmlparser2.parseDocument(html);
  const [head] = htmlparser2.DomUtils.find(
    (elem) => elem.type === 'tag' && elem.name === 'head',
    dom.children,
    true,
    1,
  );

  if (!head || !('children' in head)) return [];
  return htmlparser2.DomUtils.find(
    (elem) => {
      if (elem.type !== 'tag' || elem.name !== 'link') return false;
      const rel = elem.attribs.rel?.toLowerCase();
      return !!(rel && rel.indexOf('icon') >= 0 && rel.indexOf('mask-icon') < 0);
    },
    head.children,
    false,
    100,
  ) as Element[];
}

export function findFaviconInHtml_orig(s: string, site: string) {
  const icons = findIconRelLinks(s);

  if (icons.length > 0) {
    let items = [];
    for (const icon of icons) {
      const attr = icon.attribs;
      const { rel, href, type, sizes, mask, ...rest } = icon.attribs;
      printUnknownLinkRelIconAttrs(rest, site);
      if (!href) continue;
      if ((attr.type?.startsWith('image/svg') || href.endsWith('.svg')) && typeof mask !== 'string') {
        return { type: 'image/svg+xml', href: href };
      } else {
        const width = parseInt((sizes || '-1').split('x')[0], 10);
        items.push({ href, width, type, mask: typeof mask === 'string' });
      }
    }

    // svg => 6
    // png => 4
    // jpeg => 2
    // ico => 0
    //
    // mask => -1

    // (64, x) => 2
    // (32, 64] => 4
    // (0, 32] => 3
    // 'any'   => 3
    // -       => 1

    items = magicSort(items);
    // console.log(items);

    for (const item of items) {
      if (item.width >= 60) {
        return { href: item.href, type: item.type };
      }
    }
    for (const item of items) {
      // prefer png
      if (item.type === 'image/png') {
        return { href: item.href, type: item.type };
      }
    }

    const item0 = items[0];
    if (item0) {
      return { href: item0.href, type: item0.type };
    } else {
      // something went wrong
      return { href: '/favicon.ico' };
    }
  }
  return { href: '/favicon.ico' };
}

function filetype(attrType: string, href: string) {
  const a = attrType?.toLowerCase();
  const h = href.toLowerCase();
  if (a?.startsWith('image/svg') || h.endsWith('.svg')) return 'svg';
  if (a?.startsWith('image/png') || h.endsWith('.png')) return 'png';
  if (a?.startsWith('image/jpeg') || h.endsWith('.jpg') || h.endsWith('.jpeg')) return 'jpg';
}

export function findFaviconInHtml(s: string, site: string) {
  const icons = findIconRelLinks(s);

  if (icons.length > 0) {
    const items = [];
    for (const icon of icons) {
      const attr = icon.attribs;
      const { rel, href, type, sizes, mask, ...rest } = icon.attribs;
      printUnknownLinkRelIconAttrs(rest, site);
      if (!href) continue;
      let weight = 0;
      let type0: string | undefined;

      // svg => 10
      // png => 4
      // jpg => 2
      // ico => 0
      const ft = filetype(attr.type, href);
      switch (ft) {
        case 'svg':
          type0 = 'image/svg+xml';
          weight += 10;
          break;
        case 'png':
          weight += 4;
          break;
        case 'jpg':
          weight += 2;
          break;
      }

      // mask => -30
      if (typeof mask === 'string') weight += -30;

      // normal sizes 16 32 48 64 80 96 128 144 180
      //
      // (96, +) => 3.6
      // (80, 96] => 4
      // (64, 80] => 4.5
      // (48, 64] => 5
      // (32, 48] => 3.9
      // (16, 32] => 3.4
      // (0, 16] => 3
      // 'any'   => 3.5
      // NaN       => 1
      if (sizes === 'any') {
        weight += 3.5;
      } else {
        const width = parseInt((sizes || '0').split('x')[0], 10);
        if (width > 96) {
          weight += 3.5;
        } else if (width > 80) {
          weight += 4;
        } else if (width > 64) {
          weight += 4.5;
        } else if (width > 48) {
          weight += 5;
        } else if (width > 32) {
          weight += 3.9;
        } else if (width > 16) {
          weight += 3.4;
        } else if (width > 0) {
          weight += 3;
        } else {
          weight += 1;
        }
      }

      items.push({ href, weight, type: type0 || type });
    }

    // big to small
    items.sort((a, b) => b.weight - a.weight);

    const item0 = items[0];
    if (item0) {
      return { href: item0.href, type: item0.type };
    } else {
      // something went wrong
      return { href: '/favicon.ico' };
    }
  }
  return { href: '/favicon.ico' };
}

export async function favicon(site: string) {
  const { html, base } = await request(site);
  const { type, href } = findFaviconInHtml(html, site);

  if (href.substring(0, 5) === 'data:') {
    const ret = datauriUtil.parse(href);
    if (!ret.type && type) ret.type = type;
    return ret;
  }

  return { type, url: makeAbsUrl(base, href) };
}

export enum FaviconErrorCode {
  FaviconNotFound,
}

export class FaviconError extends Error {
  constructor(public code: FaviconErrorCode) {
    super('' + code);
    Error.captureStackTrace(this, this.constructor);
  }
}

export async function buf(
  input: { type?: string; url: string },
  site?: string,
): Promise<{ buffer: ArrayBuffer; type?: string }> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT);
  const res = await fetch(input.url, {
    ...fetchInit,
    signal: controller.signal,
    headers: { 'User-Agent': UA },
  });
  clearTimeout(id);

  if ((res.status === 403 || res.status === 401) && !input.url.startsWith('https://icons.duckduckgo.com/ip3/')) {
    // we are likely blocked by Cloudflare etc.
    return buf({ url: `https://icons.duckduckgo.com/ip3/${site}.ico` });
  }

  if (res.status === 404 && !input.url.startsWith('https://icons.duckduckgo.com/ip3/')) {
    return buf({ url: `https://icons.duckduckgo.com/ip3/${site}.ico` });
  }

  const ct = res.headers.get('content-type');
  if (ct && ct.startsWith('text/html')) {
    throw new FaviconError(FaviconErrorCode.FaviconNotFound);
  }

  const buffer = await res.arrayBuffer();

  const type = typeFromExt(input.url);

  if (input.type) {
    if (input.type === type) {
      return { type: input.type, buffer };
    } else {
      const x = await fileTypeFromBuffer(buffer);
      const type = x?.mime;
      if (type) {
        return { type, buffer };
      } else {
        return { type: input.type, buffer };
      }
    }
  }

  if (type) {
    return { type, buffer };
  }

  return { buffer };
}

function typeFromExt(x: string) {
  const l = x.toLowerCase();
  if (l.endsWith('.ico')) return 'image/x-icon';
  if (l.endsWith('.png')) return 'image/png';
  if (l.endsWith('.jpg') || l.endsWith('.jpeg')) return 'image/jpeg';
  if (l.endsWith('.svg')) return 'image/svg+xml';
}
