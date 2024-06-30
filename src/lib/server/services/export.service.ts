import { randomUUID } from 'node:crypto';
import * as fs from 'node:fs';
import { unlink, writeFile } from 'node:fs/promises';
import * as path from 'node:path';
import { pipeline } from 'node:stream/promises';

import { stringify } from 'csv-stringify';

import { DATA_DIR } from '$lib/env';
import { forbidden, notFound } from '$lib/server/handlers/helper';
import { sleep } from '$lib/utils/common.util';

import type { BookmarkService } from './bookmark.service';
import type { GroupService } from './group.service';
import type { TagService } from './tag.service';

// created group tags url title description
export class ExportService {
  constructor(
    private groupSvc: GroupService,
    private tagSvc: TagService,
    private bookmarkSvc: BookmarkService,
  ) {}

  async removeExportFile(filename: string) {
    const filepath = path.join(DATA_DIR, filename);
    try {
      await unlink(filepath);
    } catch (e) {
      // ignore
    }
  }

  async run(userId: number) {
    const groups = this.groupSvc.all({ userId });
    const groupCount = groups.length;
    const groupMap = new Map<number, { name: string; id: number }>();
    groups.forEach((g) => groupMap.set(g.id, g));
    await sleep(0);
    const tags = this.tagSvc.getAllTags({ userId });
    const tagCount = tags.length;
    const tagMap = new Map<number, { name: string; id: number }>();
    tags.forEach((g) => tagMap.set(g.id, g));
    await sleep(0);

    const pageSize = 10;
    let len = pageSize;

    let after: { updatedAt: number; id: number } | undefined;

    const stringifier = stringify({
      columns: ['created', 'group', 'tags', 'url', 'title', 'description'],
      header: true,
    });
    const now = Date.now();
    const filename = `export-${userId}-${randomUUID()}-${now}.csv`;
    const filepath = path.join(DATA_DIR, filename);

    // check permission up front to avoid dealing with stream related error handling
    try {
      // test writing to the file
      await writeFile(filepath, ' ', 'utf8');
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === 'ENOENT') {
        return notFound();
      } else if ((e as NodeJS.ErrnoException).code === 'EACCES') {
        return forbidden();
      }
      throw e;
    }

    const ws = fs.createWriteStream(filepath);
    const promise = pipeline(stringifier, ws);
    let bookmarkCount = 0;
    while (len === pageSize) {
      const bookmarks = this.bookmarkSvc.getBookmarks({
        user: { userId },
        limit: pageSize,
        ...(after ? { after } : null),
      });
      len = bookmarks.length;
      bookmarkCount += len;
      const last = bookmarks[len - 1];
      after = { updatedAt: last.updatedAt!, id: last.id };
      await sleep(0);
      bookmarks.forEach((b) => {
        const group = typeof b.groupId === 'number' ? groupMap.get(b.groupId)?.name : undefined;
        const tags = Array.isArray(b.tagIds) ? b.tagIds.map((id) => tagMap.get(id)!.name).join(',') : undefined;
        stringifier.write([b.createdAt, group, tags, b.url, b.title, b.desc]);
      });
    }
    stringifier.end();
    await promise;
    return { tagCount, groupCount, bookmarkCount, filename };
  }
}
