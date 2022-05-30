import { type RequestHandler, json } from '@sveltejs/kit';

import { ensureUser } from '$lib/server/handlers/helper';
import { wrap } from '$lib/server/handlers/wrap';
import { bookmark as bookmarkSvc } from '$lib/server/services/bookmark.service';
import { bookmarkTagSvc } from '$lib/server/services/bookmarkTag.service';
import { tag as tagSvc } from '$lib/server/services/tag.service';
import * as importUtil from '$lib/utils/import.util';

export const POST: RequestHandler = async (event) => {
  return wrap(event, async (event) => {
    const t0 = Date.now();
    const user = ensureUser(event);
    const cnt = await event.request.text();
    const items = importUtil.parsePocketExportHtml(cnt);
    const count = doImport({ items, userId: user.userId });
    console.log('The import took', Date.now() - t0);
    return json({ count });
  });
};

function doImport(opts: { items: importUtil.PocketBookmarkItem[]; userId: number }) {
  const { items, userId } = opts;

  const tagIdLookup = new Map<string, number>();

  const tagItems = [];
  for (const item of items) {
    item.tags.forEach((t) => {
      if (!tagIdLookup.has(t.name)) {
        tagIdLookup.set(t.name, 0);
        tagItems.push(t);
      }
    });
  }

  const { result: tagResults } = tagSvc.batchUpsertTag({ userId, items: tagItems });

  for (let i = 0; i < tagResults.length; i++) {
    const ret = tagResults[i];
    if (typeof ret === 'number') tagIdLookup.set(tagItems[i].name, ret);
  }

  const bookmarkItems = [];
  for (const item of items) {
    const { url, title, createdAt } = item;
    bookmarkItems.push({ url, title, createdAt });
  }

  let bookmarkCount = 0;
  const { result: bookmarkResults } = bookmarkSvc.batchUpsertBookmark({ userId, items: bookmarkItems });

  const boookmarkTagItems = [];
  for (let i = 0; i < bookmarkResults.length; i++) {
    const bookmarkId = bookmarkResults[i];
    const b = items[i];
    if (typeof bookmarkId !== 'number') continue;
    bookmarkCount++;
    if (!b.tags || b.tags.length === 0) continue;
    for (const t of b.tags) {
      const tagId = tagIdLookup.get(t.name);
      if (tagId) boookmarkTagItems.push({ bookmarkId, tagId });
    }
  }
  bookmarkTagSvc.batchUpsertBookmarkTag({ userId, items: boookmarkTagItems });
  return bookmarkCount;
}
