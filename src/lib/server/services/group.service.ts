import * as groupDb from '$lib/server/db/group.db';
import type {
  InputBatchUpsertGroup,
  InputCreateGroup,
  InputDeleteGroup,
  InputGetAllGroups,
  InputUpdateGroup,
} from '$lib/type';

import { ApiError, HttpStatus } from '../api.error';
import { isConflict, lite } from '../db/common.db';

export const group = {
  unused_create: (input: InputCreateGroup) => {
    const db = lite();
    try {
      return groupDb.create(db, input);
    } catch (e) {
      if (isConflict(e)) {
        throw new ApiError(HttpStatus.CONFLICT);
      }
      throw e;
    }
  },
  upsert: (input: InputCreateGroup) => {
    const db = lite();
    return groupDb.upsert(db, input);
  },
  all: (input: InputGetAllGroups) => {
    const db = lite();
    return groupDb.all(db, input);
  },
  updateGroupById(input: InputUpdateGroup) {
    const db = lite();
    try {
      groupDb.updateGroupById(db, input);
    } catch (e) {
      if (isConflict(e)) {
        throw new ApiError(HttpStatus.CONFLICT);
      }
      throw e;
    }
  },
  deleteGroupById: (input: InputDeleteGroup) => {
    const db = lite();
    return groupDb.deleteGroupById(db, input);
  },
  batchUpsertGroup: (input: InputBatchUpsertGroup) => {
    const db = lite();
    return groupDb.batchUpsertGroup(db, input);
  },
};

export type GroupService = typeof group;
