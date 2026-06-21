import type { Database } from 'better-sqlite3';

import * as bookmarkDb from '$lib/server/db/bookmark.db';
import * as stashDb from '$lib/server/db/bookmarkStash.db';
import { lite } from '$lib/server/db/common.db';
import * as groupDb from '$lib/server/db/group.db';
import * as jobDb from '$lib/server/db/job.db';
import * as tagDb from '$lib/server/db/tag.db';
import * as userDb from '$lib/server/db/user.db';
import { UserService } from '$lib/server/services/user.service';
import type { InputCreateUser } from '$lib/type';
import { isEmail } from '$lib/utils/common.util';

import { ApiError, HttpStatus } from '../api.error';
import { migrateData } from './data-migrate';

type ValidationErrorItem = { field: string; message: string };

function jsonResponse(data: unknown, status = HttpStatus.OK) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function noContent() {
  return new Response(undefined, { status: HttpStatus.NO_CONTENT });
}

function validationError(field: string, message: string) {
  return jsonResponse({ errors: [{ field, message } satisfies ValidationErrorItem] }, HttpStatus.BAD_REQUEST);
}

function apiErrorResponse(error: ApiError) {
  return jsonResponse(error.toJSON(), error.status);
}

function ensureUserId(id: string | number) {
  const userId = typeof id === 'number' ? id : parseInt(id, 10);
  if (isNaN(userId)) throw new ApiError(HttpStatus.BAD_REQUEST, undefined, 'Invalid id');
  return userId;
}

export function createCliAdminCommands(db: Database = lite()) {
  const userSvc = new UserService(db);

  const run = async (fn: () => Promise<Response> | Response) => {
    try {
      return await fn();
    } catch (error) {
      if (error instanceof Response) return error;
      if (error instanceof ApiError) return apiErrorResponse(error);
      throw error;
    }
  };

  return {
    createUser: (username: string, password: string, options: InputCreateUser['options']) =>
      run(async () => {
        if (!username) return validationError('username', 'Invalid username');
        if (!isEmail(username)) return validationError('username', 'Username must be an email');
        if (!password) return validationError('password', 'Invalid password');
        await userSvc.createUser({ username, password, options });
        return noContent();
      }),

    setAdmin: (username: string) =>
      run(() => {
        if (!username) throw new ApiError(HttpStatus.BAD_REQUEST, undefined, 'Missing username');
        const user = userSvc.getUserByUsername({ username });
        if (!user) throw new ApiError(HttpStatus.NOT_FOUND, undefined, 'User not found');
        userSvc.updateUserAdmin(user, true);
        return noContent();
      }),

    unsetAdmin: (username: string) =>
      run(() => {
        if (!username) throw new ApiError(HttpStatus.BAD_REQUEST, undefined, 'Missing username');
        const user = userSvc.getUserByUsername({ username });
        if (!user) throw new ApiError(HttpStatus.NOT_FOUND, undefined, 'User not found');
        userSvc.updateUserAdmin(user, false);
        return noContent();
      }),

    migration: (to: string) =>
      run(() => {
        if (!to) throw new ApiError(HttpStatus.BAD_REQUEST, undefined, 'Missing destination path');
        const t0 = Date.now();
        migrateData({ fromFilePath: db.name, toFilePath: to });
        return jsonResponse({ duration: Date.now() - t0 });
      }),

    deleteUser: (id: string | number, username: string) =>
      run(() => {
        const userId = ensureUserId(id);
        if (!username) throw new ApiError(HttpStatus.BAD_REQUEST, undefined, 'Missing username');
        const user = userDb.getUserById(db, { id: userId });
        if (!user) throw new ApiError(HttpStatus.NOT_FOUND, undefined, 'User not found');
        if (user.username !== username)
          throw new ApiError(HttpStatus.BAD_REQUEST, undefined, 'Username and Id mismatch');

        const transact = db.transaction(() => {
          bookmarkDb.deleteBookmarksByUserId(db, { userId });
          tagDb.deleteTagsByUserId(db, { userId });
          groupDb.deleteGroupsByUserId(db, { userId });
          stashDb.deleteManyOfUser(db, { userId });
          jobDb.deleteManyOfUser(db, { userId });
          userDb.deleteUserById(db, { id: userId });
        });

        transact();
        return noContent();
      }),

    updateUserPassword: (username: string, newPassword: string) =>
      run(async () => {
        if (!username) throw new ApiError(HttpStatus.BAD_REQUEST, undefined, 'Missing username');
        if (!newPassword) throw new ApiError(HttpStatus.BAD_REQUEST, undefined, 'Missing password');
        const user = userSvc.getUserByUsername({ username });
        if (!user) throw new ApiError(HttpStatus.NOT_FOUND, undefined, 'User not found');
        await userSvc.updateUserPassword({ userId: user.id, newPassword });
        return noContent();
      }),
  };
}
