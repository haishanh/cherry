import * as userDb from '$lib/server/db/user.db';
import type { InputChangePassword, InputCheckPassword, InputCreatePasswordlessUser, InputCreateUser } from '$lib/type';
import * as passwordUtil from '$lib/utils/password.util';

import { ApiError, ApiErrorCode, HttpStatus } from '../api.error';
import { isConflict, lite } from '../db/common.db';

export const UserFeatureFlag = {
  // Strip tracking parameters in URLs when saving
  FF_STRIP_TRACKING_PARAMETERS: 0b1,
} as const;

export const DEFAULT_USER_FEATURE = 0;

export const user = {
  getUserByUsername: (input: { username: string }) => {
    const db = lite();
    return userDb.getUserByUsername(db, input);
  },
  getUserById: (input: { id: number }) => {
    const db = lite();
    return userDb.getUserById(db, input);
  },
  getUserByIdWithHydratedFeature: (input: { id: number }) => {
    const db = lite();
    const user = userDb.getUserById(db, input);
    if (!user) throw new ApiError(HttpStatus.NOT_FOUND);
    const feature0 = user.feature;
    const ff: Record<string, boolean> = {};
    ff.strip_tracking_parameters = (feature0 & UserFeatureFlag.FF_STRIP_TRACKING_PARAMETERS) > 0;
    return { ...user, ff };
  },
  createUser: async (input: InputCreateUser | InputCreatePasswordlessUser) => {
    const db = lite();
    try {
      return await userDb.createUser(db, input);
    } catch (e) {
      if (isConflict(e)) throw new ApiError(HttpStatus.CONFLICT);
      throw e;
    }
  },
  checkPassword: async (input: InputCheckPassword) => {
    const db = lite();
    const user = userDb.getUserPaswordByUsername(db, input);
    if (!user) throw new ApiError(403);
    if (!user.password) throw new ApiError(401);
    const match = await passwordUtil.verify(/*hash*/ user.password, /*plain*/ input.password);
    if (!match) throw new ApiError(401);
    return { id: user.id, username: user.username, feature: user.feature };
  },
  updateUserPassword: async (input: { userId: number; newPassword: string }) => {
    const db = lite();
    userDb.updateUserPassword(db, input);
  },
  changePassword: async (input: InputChangePassword) => {
    const db = lite();
    const user = userDb.getUserPasswordById(db, { id: input.userId });
    const match = await passwordUtil.verify(/*hash*/ user.password, /*plain*/ input.currentPassword);
    if (!match) throw new ApiError(HttpStatus.BAD_REQUEST, ApiErrorCode.InvalidPassword);
    userDb.updateUserPassword(db, { userId: input.userId, newPassword: input.newPassword });
  },
  updateFeature: (input: { userId: number; feature: number }) => {
    const db = lite();
    userDb.updateUserFeature(db, input);
  },
};
