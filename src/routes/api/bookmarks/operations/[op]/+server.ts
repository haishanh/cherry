import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import assert from 'assert';

import { ensureInt, ensureUser, requestBody } from '$lib/server/handlers/helper';
import { wrap } from '$lib/server/handlers/wrap';
import { bookmark as bookmarkSvc } from '$lib/server/services/bookmark.service';

export const POST: RequestHandler = async (event) => {
  return wrap(event, async (event) => {
    const user = ensureUser(event);
    const body = await requestBody(event);

    const op = event.params.op;
    assert(op === 'restore' || op === 'stash' || op === 'group');

    if (op === 'stash') {
      const ids = body.ids;
      assert(Array.isArray(ids));
      const key = body.key;
      assert(key);
      const data = bookmarkSvc.stashBookmarks({ user, key, ids });
      return json(data);
    } else if (op === 'restore') {
      const key = body.key;
      assert(key);
      const data = bookmarkSvc.restoreBookmarks({ user, key });
      return json(data);
    } else if (op === 'group') {
      const ids = body.ids;
      assert(Array.isArray(ids));
      const groupId = ensureInt(body.groupId);
      const data = bookmarkSvc.groupBookmarks({ user, ids, groupId });
      return json(data);
    }
  });
};
