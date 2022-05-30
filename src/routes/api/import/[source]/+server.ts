import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

import { ApiError, HttpStatus } from '$lib/server/api.error';
import { ensureUser } from '$lib/server/handlers/helper';
import { wrap } from '$lib/server/handlers/wrap';
import { bookmark as bookmarkSvc } from '$lib/server/services/bookmark.service';
import { bookmarkTagSvc } from '$lib/server/services/bookmarkTag.service';
import { group as groupSvc } from '$lib/server/services/group.service';
import { tag as tagSvc } from '$lib/server/services/tag.service';
import { Parser as NetscapeBookmarkFile1Parser } from '$lib/utils/nbf1Parser.util';
import { Parser as SimpleCsvParser } from '$lib/utils/SimpleCsvParser.util';

export const POST: RequestHandler = async (event) => {
  return wrap(event, async (event) => {
    // console.log(event.request.headers.get('Content-Type'));
    const user = ensureUser(event);
    const source = event.params.source;
    const t0 = Date.now();
    switch (source) {
      case 'netscape-bookmark-file-1': {
        const cnt = await event.request.text();
        const count = doImport({ html: cnt, userId: user.userId });
        console.log('The import took', Date.now() - t0);
        return json({ count });
      }
      case 'csv': {
        // expect a csv file as described in https://help.raindrop.io/import/#csv
        const cnt = await event.request.text();
        const count = doImportCsv({ cnt, userId: user.userId });
        console.log('The import took', Date.now() - t0);
        return json({ count });
      }
      default:
        throw new ApiError(HttpStatus.BAD_REQUEST, undefined, 'Unexpected bookmark source');
    }
  });
};

// 1 create all groups
// 2 create all tags
// 3 create all bookmarks
// 4 create all bookmark_tags
function doImport(opts: { html: string; userId: number }) {
  const { html, userId } = opts;
  const map = new Map();
  new NetscapeBookmarkFile1Parser().parse(html, (b) => {
    // XXX we probably should use utilize ADD_DATE and LAST_MODIFIED in b.attr?
    const url: string = b.attr?.HREF ?? '';
    if (!url.startsWith('https://') && !url.startsWith('http://')) return;
    const tags = b.attr?.TAGS;
    const b0 = { url, title: b.text || url, group: b.group, tags };
    if (map.has(b.group)) {
      map.get(b.group).push(b0);
    } else {
      map.set(b.group, [b0]);
    }
  });

  const groupItems = [];
  const groupKeys = [];
  for (const e of map) {
    const groupStrArr = e[0];
    // skip empty one
    if (groupStrArr.length === 0) continue;

    const name = groupStrArr.join(' / ');
    groupKeys.push(groupStrArr);
    groupItems.push({ name });
  }

  const { result: groupResults } = groupSvc.batchUpsertGroup({ userId, items: groupItems });

  const groupIdLookup = new Map<string[], number>();
  for (let i = 0; i < groupResults.length; i++) {
    const ret = groupResults[i];
    if (typeof ret === 'number') groupIdLookup.set(groupKeys[i], ret);
  }

  const tagItems: { name: string }[] = [];
  for (const e of map) {
    const bookmarks = e[1];
    for (const b of bookmarks) {
      if (typeof b.tags === 'string' && b.tags !== '') {
        b.tags.split(',').forEach((name: string) => tagItems.push({ name }));
      }
    }
  }

  const { result: tagResults } = tagSvc.batchUpsertTag({ userId, items: tagItems });

  const tagIdLookup = new Map<string, number>();
  for (let i = 0; i < tagResults.length; i++) {
    const ret = tagResults[i];
    if (typeof ret === 'number') tagIdLookup.set(tagItems[i].name, ret);
  }

  let bookmarkCount = 0;
  for (const e of map) {
    const groupKey = e[0];
    const bookmarks = e[1];
    const groupId = groupIdLookup.get(groupKey);
    const bookmarkItems = [];
    for (const b of bookmarks) {
      bookmarkItems.push({ url: b.url, title: b.title, groupId });
    }
    const { result: bookmarkResults } = bookmarkSvc.batchUpsertBookmark({ userId, items: bookmarkItems });
    bookmarkCount += bookmarkResults.length;
    const boookmarkTagItems = [];
    for (let i = 0; i < bookmarkResults.length; i++) {
      const bookmarkId = bookmarkResults[i];
      const b = bookmarks[i];
      if (typeof b.tags === 'string' && b.tags !== '' && typeof bookmarkId === 'number') {
        const tagNames: string[] = [];
        b.tags.split(',').forEach((name: string) => tagNames.push(name));
        for (const name of tagNames) {
          const tagId = tagIdLookup.get(name);
          if (tagId) boookmarkTagItems.push({ bookmarkId, tagId });
        }
      }
    }
    bookmarkTagSvc.batchUpsertBookmarkTag({ userId, items: boookmarkTagItems });
  }
  return bookmarkCount;
}

function throwInvalidCsvFile(msg: string) {
  throw new ApiError(HttpStatus.BAD_REQUEST, undefined, 'Invalid CSV file: ' + msg);
}

function isStrAllDigits(input: string) {
  for (const s of input) {
    if (!(s >= '0' && s <= '9')) return false;
  }
  return true;
}

function timestamp(input: string | undefined): number | undefined {
  if (!input) return;
  // we want to check if input is make of only digits before parseInt
  // since something like `parseInt('1a2', 10)` returns 1
  if (isStrAllDigits(input)) return parseInt(input, 10);
  const t = new Date(input).getTime();
  if (isNaN(t)) return;
  return Math.trunc(t / 1000);
}

function doImportCsv(opts: { cnt: string; userId: number }) {
  const { cnt, userId } = opts;

  let header: string[];
  const columns = ['url', 'title', 'description', 'folder', 'tags', 'created'];
  const columnToIdx: Record<string, number> = {};

  const groups: { name: string }[] = [];
  const seenGroupName = new Map<string, { name: string }>();

  const tags: { name: string }[] = [];
  const seenTagName = new Map<string, { name: string }>();

  const bookmarks0: {
    url: string;
    title?: string;
    desc?: string;
    folder?: { name: string };
    tags?: { name: string }[];
    createdAt?: number;
  }[] = [];
  new SimpleCsvParser().parse(cnt, (row) => {
    const items = row.map((item) => item.trim());
    if (!header) {
      header = items;
      if (header.indexOf('url') < 0) throwInvalidCsvFile('missing column url');
      for (const col of columns) {
        const idx = header.indexOf(col);
        if (idx >= 0) columnToIdx[col] = idx;
      }
      return;
    }

    const url = items[columnToIdx['url']];
    const title = items[columnToIdx['title']];
    const desc = items[columnToIdx['description']];
    const folder0 = items[columnToIdx['folder']];
    const tags0 = items[columnToIdx['tags']];
    const created0 = items[columnToIdx['created']];

    let folder: { name: string };
    if (folder0) {
      if (!seenGroupName.has(folder0)) {
        const g = { name: folder0 };
        seenGroupName.set(folder0, g);
        groups.push(g);
      }
      folder = seenGroupName.get(folder0);
    }

    let tags1: { name: string }[];
    if (tags0) {
      tags1 = tags0.split(',').map((x: string) => {
        const name = x.trim();
        if (!seenTagName.has(name)) {
          const t = { name };
          seenTagName.set(name, t);
          tags.push(t);
        }
        return seenTagName.get(name);
      });
    }

    const createdAt = timestamp(created0);

    bookmarks0.push({
      url,
      title,
      desc,
      // use reference
      folder,
      tags: tags1,
      createdAt,
    });
  });

  const { result: groupResults } = groupSvc.batchUpsertGroup({ userId, items: groups });

  const groupIdLookup = new Map<{ name: string }, number>();
  for (let i = 0; i < groupResults.length; i++) {
    const ret = groupResults[i];
    if (typeof ret === 'number') groupIdLookup.set(groups[i], ret);
  }

  const { result: tagResults } = tagSvc.batchUpsertTag({ userId, items: tags });

  const tagIdLookup = new Map<{ name: string }, number>();
  for (let i = 0; i < tagResults.length; i++) {
    const ret = tagResults[i];
    if (typeof ret === 'number') tagIdLookup.set(tags[i], ret);
  }

  const bookmarkItems = [];
  for (const b of bookmarks0) {
    const { url, title, desc, folder, createdAt } = b;
    const groupId = folder ? groupIdLookup.get(folder) : undefined;
    bookmarkItems.push({ url, title, desc, groupId, createdAt });
  }
  let bookmarkCount = 0;
  const { result: bookmarkResults } = bookmarkSvc.batchUpsertBookmark({ userId, items: bookmarkItems });

  const boookmarkTagItems = [];
  for (let i = 0; i < bookmarkResults.length; i++) {
    const bookmarkId = bookmarkResults[i];
    const b = bookmarks0[i];

    if (typeof bookmarkId !== 'number') continue;
    bookmarkCount++;

    if (b.tags) {
      for (const t of b.tags) {
        const tagId = tagIdLookup.get(t);
        if (tagId) boookmarkTagItems.push({ bookmarkId, tagId });
      }
    }
  }
  bookmarkTagSvc.batchUpsertBookmarkTag({ userId, items: boookmarkTagItems });

  return bookmarkCount;
}
