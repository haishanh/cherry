import type { Database } from 'better-sqlite3';

import type * as bookmarkStashDb from '$lib/server/db/bookmarkStash.db';

const ONE_DAY_SEC = 24 * 60 * 60;

export class BookmarkStashService {
  constructor(
    private db: Database,
    private bookmarkStashDao: typeof bookmarkStashDb,
  ) {}

  cleanup() {
    const stashItems = this.bookmarkStashDao.all(this.db, {});
    const nowSec = Math.ceil(Date.now() / 1000);
    const expiredStashIds = stashItems.filter((item) => nowSec - ONE_DAY_SEC > item.createdAt).map((item) => item.id);
    this.bookmarkStashDao.deleteMany(this.db, { ids: expiredStashIds });
  }
}
