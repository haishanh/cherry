import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import assert from 'assert';

import { PAGE_BOOKMARK_LIMIT } from '$lib/env';
import { ensureInt, ensureUser, requestBody, zalidate } from '$lib/server/handlers/helper';
import { wrap } from '$lib/server/handlers/wrap';
import { bookmark as bookmarkSvc } from '$lib/server/services/bookmark.service';
import {
  type GetBookmarksOpts,
  type InputCreateBookmark,
  type InputFindBookmarksOfUser,
  type PageMetaBookmarks,
  SchemaCreateBookmark,
} from '$lib/type';

export const GET: RequestHandler = async (event) => {
  return wrap(event, async (event) => {
    const user = ensureUser(event);
    const searchParams = event.url.searchParams;

    // validate elements are string numbers/ints
    const tagQuery = searchParams.get('tag');
    const groupQuery = searchParams.get('group');
    const qQuery = searchParams.get('q');
    const random = searchParams.has('random');
    const tagIds = (tagQuery || '').split(',');
    const allOpts: Partial<GetBookmarksOpts> = { user };
    if (qQuery) allOpts.text = qQuery;
    if (tagQuery) allOpts.tagIds = tagIds.map(ensureInt);
    if (groupQuery) allOpts.groupId = ensureInt(groupQuery);
    const afterStr = searchParams.get('after');
    if (afterStr) allOpts.after = parsePageCursor(afterStr);
    const p = searchParams.get('p');
    if (p) allOpts.page = parseInt(p, 10);

    // type Data = { items: BookmarkFromDb[]; count: number; totalPage: number; }
    const { data } = random
      ? bookmarkSvc.getRandomBookmarks({ user, take: 10 })
      : bookmarkSvc.findBookmarks(allOpts as InputFindBookmarksOfUser);

    const meta: PageMetaBookmarks = {};
    if ('text' in allOpts) {
      //
    } else {
      const items = data.items;
      if (items.length >= PAGE_BOOKMARK_LIMIT) {
        const last = items[items.length - 1];
        meta.after = last.updatedAt + '.' + last.id;
      }
    }
    if (data) {
      return json({ meta, data });
    } else {
      return new Response(undefined, { status: 500 });
    }
  });
};

export const POST: RequestHandler = async (event) => {
  return wrap(event, async (event) => {
    const user = ensureUser(event);
    const body = await requestBody(event);
    const sp = event.url.searchParams;
    const toValidate = { ...body, user };
    if (sp.has('meta')) {
      try {
        const { title, desc } = await fetchMeta(body.url);
        if (title) toValidate.title = title;
        if (desc) toValidate.desc = desc;
      } catch (e) {
        // ignore
      }
    }
    const input = zalidate(SchemaCreateBookmark, toValidate);
    const data = bookmarkSvc.createBookmark(input as InputCreateBookmark);
    return json(data);
  });
};

//// helpers
function parsePageCursor(s: string) {
  const [u, i] = s.split('.');
  const updatedAt = parseInt(u, 10);
  const id = parseInt(i, 10);
  assert(!isNaN(updatedAt));
  assert(!isNaN(id));
  return { updatedAt, id };
}

async function fetchMeta(url: string) {
  const mod = await import('html-metadata-parser');
  // @ts-ignore
  const parser = mod.default ? mod.default.parser : mod.parser;
  const result = await parser(url);
  return {
    url,
    title: result.og?.title || result.meta?.title || '',
    desc: result.og?.description || result.meta?.description || '',
  };
}
