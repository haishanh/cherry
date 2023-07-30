import { lite } from '$lib/server/db/common.db';

export function deleteDangleBookmarkTag() {
  const db = lite();
  const stmt1 = db.prepare('select tagId,bookmarkId from bookmark_tag');
  const stmt2 = db.prepare('select id from bookmark where id = ?');
  const stmt3 = db.prepare('delete from bookmark_tag where bookmarkId = ?');
  const transact = db.transaction(() => {
    const items = stmt1.all() as { tagId: number; bookmarkId: number }[];
    items.forEach((item) => {
      const bookmark = stmt2.get([item.bookmarkId]) as { id: number };
      if (!bookmark) stmt3.run([item.bookmarkId]);
    });
  });
  transact();
}
