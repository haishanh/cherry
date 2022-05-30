import * as tagDb from '$lib/server/db/tag.db';
import type {
  InputBatchGetTags,
  InputBatchUpsertTag,
  InputCreateTag,
  InputDeleteTag,
  InputGetAllTags,
  InputUpdateTag,
} from '$lib/type';

import { ApiError, HttpStatus } from '../api.error';
import { isConflict, lite } from '../db/common.db';

export const tag = {
  upsert: (input: InputCreateTag) => {
    const db = lite();
    return tagDb.upsertTag(db, input);
  },
  getAllTags: (input: InputGetAllTags) => {
    const db = lite();
    return tagDb.getAllTags(db, input);
  },
  batchGetTags: (input: InputBatchGetTags) => {
    const db = lite();
    return tagDb.batchGetTags(db, input);
  },
  updateTagById: (input: InputUpdateTag) => {
    const db = lite();
    try {
      tagDb.updateTagById(db, input);
    } catch (e) {
      if (isConflict(e)) throw new ApiError(HttpStatus.CONFLICT);
      throw e;
    }
  },
  deleteTagById: (input: InputDeleteTag) => {
    const db = lite();
    return tagDb.deleteTagById(db, input);
  },
  batchUpsertTag: (input: InputBatchUpsertTag) => {
    const db = lite();
    return tagDb.batchUpsertTag(db, input);
  },
};
