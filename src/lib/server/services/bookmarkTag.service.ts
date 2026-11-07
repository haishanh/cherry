import * as bookmarkTagDb from '#lib/server/db/bookmarkTag.db.js';
import type { InputBatchUpsertBookmarkTag } from '#lib/type.js';

import { lite } from '../db/common.db';

export const bookmarkTagSvc = {
  batchUpsertBookmarkTag: (input: InputBatchUpsertBookmarkTag) => {
    const db = lite();
    return bookmarkTagDb.batchUpsertBookmarkTag(db, input);
  },
};
