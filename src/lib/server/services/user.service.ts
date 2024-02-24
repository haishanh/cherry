import type { Database } from 'better-sqlite3';

import * as userDb from '$lib/server/db/user.db';
import type {
  InputChangePassword,
  InputCheckPassword,
  InputCreateUser,
  UserFromDb,
  UserFromDbHydrated,
} from '$lib/type';
import * as passwordUtil from '$lib/utils/password.util';

import { ApiError, ApiErrorCode, HttpStatus } from '../api.error';
import { isConflict } from '../db/common.db';

export const UserFeatureFlag = {
  // Strip tracking parameters in URLs when saving
  FF_STRIP_TRACKING_PARAMETERS: 0b1,
} as const;

export const DEFAULT_USER_FEATURE = 0;

const USER_ATTRIBUTE = {
  admin: 0b1,
} as const;

export const DEFAULT_USER_ATTRIBUTE = 0;

export enum UserServiceErrorCode {
  UserNotFound,
}

export class UserServiceError {
  constructor(public readonly code: UserServiceErrorCode) {}
}

export class UserService {
  constructor(private db: Database) {}

  getUserByUsername(input: { username: string }) {
    return userDb.getUserByUsername(this.db, input);
  }

  getUserById(input: { id: number }) {
    return userDb.getUserById(this.db, input);
  }

  getUserByIdWithHydratedFeature(input: { id: number }) {
    const user = userDb.getUserById(this.db, input);
    if (!user) throw new UserServiceError(UserServiceErrorCode.UserNotFound);
    const feature0 = user.feature;
    const ff: Record<string, boolean> = {};
    ff.strip_tracking_parameters = (feature0 & UserFeatureFlag.FF_STRIP_TRACKING_PARAMETERS) > 0;
    const attr0 = user.attr;
    const attr: Record<string, boolean> = {};
    attr['admin'] = (attr0 && USER_ATTRIBUTE.admin) > 0;
    return { ...user, ff, attr } as UserFromDbHydrated;
  }

  async createUser(input: InputCreateUser) {
    const { username, password, options } = input;
    let attr = DEFAULT_USER_ATTRIBUTE;
    if (options.admin === true) attr = attr | USER_ATTRIBUTE.admin;
    try {
      return await userDb.createUser(this.db, { username, password, attr });
    } catch (e) {
      if (isConflict(e)) throw new ApiError(HttpStatus.CONFLICT);
      throw e;
    }
  }

  async checkPassword(input: InputCheckPassword) {
    const user = userDb.getUserPaswordByUsername(this.db, input);
    if (!user) throw new ApiError(403);
    if (!user.password) throw new ApiError(401);
    const match = await passwordUtil.verify(/*hash*/ user.password, /*plain*/ input.password);
    if (!match) throw new ApiError(401);
    return { id: user.id, username: user.username, feature: user.feature };
  }

  updateUserAdmin(user: Omit<UserFromDb, 'password'>, onoff: boolean) {
    const attr = onoff ? user.attr | USER_ATTRIBUTE.admin : user.attr & ~USER_ATTRIBUTE.admin;
    const id = user.id;
    return userDb.updateUserAttr(this.db, { id, attr });
  }

  async updateUserPassword(input: { userId: number; newPassword: string }) {
    await userDb.updateUserPassword(this.db, input);
  }

  async changePassword(input: InputChangePassword) {
    const user = userDb.getUserById(this.db, { id: input.userId });
    const match = await passwordUtil.verify(/*hash*/ user.password, /*plain*/ input.currentPassword);
    if (!match) throw new ApiError(HttpStatus.BAD_REQUEST, ApiErrorCode.InvalidPassword);
    userDb.updateUserPassword(this.db, { userId: input.userId, newPassword: input.newPassword });
  }

  updateFeature(input: { userId: number; feature: number }) {
    userDb.updateUserFeature(this.db, input);
  }
}
