import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import assert from 'assert';

import { DATABASE_PATH } from '$lib/env';
import { migrateData } from '$lib/server/admin/data-migrate';
import { deleteDangleBookmarkTag } from '$lib/server/admin/delete-dangle-bookmark-tag';
import { ApiError } from '$lib/server/api.error';
import { createUser, requestBody } from '$lib/server/handlers/helper';
import { wrap } from '$lib/server/handlers/wrap';
import { adminSvc } from '$lib/server/services/admin.service';
import { user as userSvc } from '$lib/server/services/user.service';

export const POST: RequestHandler = async (event) => {
  return wrap(event, async (event) => {
    const cmd = event.params.cmd;
    switch (cmd) {
      case 'update-user-password':
        return cmdUpdateUserPassword(event);
      case 'create-user': {
        const body = await requestBody(event);
        return await createUser(body);
      }
      case 'delete-user': {
        const body = await requestBody(event);
        const { username, id } = body;
        await adminSvc.deleteUser({ username, id });
        await adminSvc.deleteUserResource({ id });
        return new Response(undefined, { status: 204 });
      }
      case 'delete-user-resource': {
        const body = await requestBody(event);
        const { id } = body;
        await adminSvc.deleteUserResource({ id });
        return new Response(undefined, { status: 204 });
      }
      case 'migration': {
        const body = await requestBody(event);
        return cmdMigration(body);
      }
      case 'delete-dangle-bookmark-tag': {
        const t0 = Date.now();
        deleteDangleBookmarkTag();
        const t1 = Date.now();
        return json({ duration: t1 - t0 });
      }
      default:
        return new Response(undefined, { status: 400 });
    }
  });
};

/////

const cmdUpdateUserPassword: RequestHandler = async (event) => {
  const body = await requestBody(event);
  const { username, newPassword } = body;
  assert(username, new ApiError(400, undefined, 'Missing username'));
  assert(newPassword, new ApiError(400, undefined, 'Missing password'));
  const user = userSvc.getUserByUsername({ username });
  // TODO 404
  const userId = user.id;
  userSvc.updateUserPassword({ userId, newPassword });
  return new Response(undefined, { status: 204 });
};

function cmdMigration(input: { to: string }) {
  assert(input.to);
  const toFilePath = input.to;
  const t0 = Date.now();
  migrateData({ fromFilePath: DATABASE_PATH, toFilePath });
  const t1 = Date.now();
  return json({ duration: t1 - t0 });
}
