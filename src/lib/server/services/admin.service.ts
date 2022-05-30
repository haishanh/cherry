import * as userDb from '$lib/server/db/user.db';
import type { InputAdminDeleteUser } from '$lib/type';

import { ApiError } from '../api.error';
import { lite } from '../db/common.db';
import { logger } from '../logger';

export const adminSvc = {
  deleteUser: async (input: InputAdminDeleteUser) => {
    // username is not strictly needed
    // it's just a friction to prevent admin from deleting the user they are not intending to
    const { id, username } = input;
    const db = lite();
    const user = userDb.getUserById(db, { id });
    if (user?.username !== username) throw new ApiError(400);

    logger.info('deleting user id=%s username=%s', id, username);
    // proceed to delete
    userDb.deleteUserById(db, { id });
  },

  deleteUserResource: async (input: { id: number }) => {
    const userId = input.id;
    const db = lite();

    // we don't need to handle bookmark_tag
    // they will be taken care by the SQLite trigger

    const tagDb = await import('$lib/server/db/tag.db');
    tagDb.deleteTagsByUserId(db, { userId });
    const groupDb = await import('$lib/server/db/group.db');
    groupDb.deleteGroupsByUserId(db, { userId });
    const bookmarkDb = await import('$lib/server/db/bookmark.db');
    bookmarkDb.deleteBookmarksByUserId(db, { userId });
  },
};
