import * as bookmarkTagDb from '$lib/server/db/bookmarkTag.db';
import type { InputBatchUpsertBookmarkTag } from '$lib/type';

import { lite } from '../db/common.db';

export const bookmarkTagSvc = {
  batchUpsertBookmarkTag: (input: InputBatchUpsertBookmarkTag) => {
    const db = lite();
    return bookmarkTagDb.batchUpsertBookmarkTag(db, input);
  },
};
