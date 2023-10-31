import { z } from 'zod';

export type UserId = string | number;
type BookmarkId = string | number;
type TagId = string | number;

export type BookmarkFromDb = {
  id: number;
  title: string;
  desc: string;
  url: string;
  createdAt?: number;
  updatedAt?: number;
  groupId?: number;
  tagIds?: number[];
  // tags?: number[];
};

export type TagType = { id: number; name: string };
export type NewTagType = Omit<TagType, 'id'>;

export type GroupType = { id: number; name: string };

export type InputBatchUpsertBookmarkItem = {
  url: string;
  title?: string;
  desc?: string;
  groupId?: number;
  createdAt?: number;
};

export type InputBatchUpsertBookmark = {
  userId: number;
  items: InputBatchUpsertBookmarkItem[];
};

export type UserCore = { userId: number };
export type User = UserCore & { feature: number };
export type UserFromDb = {
  id: number;
  username: string;
  password: string;
  feature: number;
  attr: number;
};
export type UserFromDbHydrated = Omit<UserFromDb, 'attr'> & {
  ff: {
    strip_tracking_parameters: boolean;
  };
  attr: {
    admin: boolean;
  };
};

export type UserMe = Omit<UserFromDbHydrated, 'password'> & {
  passwordless: boolean;
};

export type InputCreateBookmark = {
  url: string;
  user: User;
  title?: string;
  desc?: string;
  tags?: NewTagType[];
  group?: GroupType | null;
};

const SchemaUserInUpdateBookmark = z.object({
  userId: z.number().int(),
  feature: z.number().int(),
});

const SchemaTagsInUpdateBookmark = z.array(z.object({ id: z.number().optional(), name: z.string() })).optional();

const SchemaGroupInUpdateBookmark = z
  .object({ id: z.number().int(), name: z.string().optional() })
  .optional()
  .nullable();

export const SchemaCreateBookmark = z.object({
  user: SchemaUserInUpdateBookmark,
  url: z.string(),
  title: z.string().optional(),
  desc: z.string().optional(),
  tags: SchemaTagsInUpdateBookmark,
  group: SchemaGroupInUpdateBookmark,
});

export const SchemaUpdateBookmark = z.object({
  id: z.number().int(),
  user: SchemaUserInUpdateBookmark,
  url: z.string().optional(),
  title: z.string().optional(),
  desc: z.string().optional(),
  tags: SchemaTagsInUpdateBookmark,
  group: SchemaGroupInUpdateBookmark,
});

export type InputUpdateBookmark = {
  id: number;
  user: User;
  url?: string;
  title?: string;
  desc?: string;
  tags?: TagType[];
  group?: GroupType;
};

export type InputGetBookmarkWithUrl = {
  url: string;
  userId: UserId;
};

export type InputGetBookmark = {
  id: number;
  user: User;
};

export type InputDeleteBookmark = {
  id: BookmarkId;
  user: User;
};
export type InputGroupMultiBookmarks = {
  user: User;
  ids: BookmarkId[];
  groupId: number;
};
export type InputStashMultiBookmarks = {
  user: User;
  key: string;
  ids: BookmarkId[];
};
export type InputRestoreMultiBookmarks = {
  user: User;
  key: string;
};

export type InputGetRandomBookmarksOfUser = {
  user: User;
  take: number;
};

export type GetBookmarksOpts = {
  user: User;
  text?: string;
  page?: number;
  after?: { updatedAt: number; id: number };
  tagIds?: TagId[];
  groupId?: number;
};

export type InputGetBookmarkCountOfUser = {
  user: UserCore;
};

export type InputFindBookmarksOfUser = {
  user: UserCore;
  text?: string;
  page?: number;
  limit?: number;
  after?: { updatedAt: number; id: number };
  groupId?: number;
  tagIds?: number[];
};

export type InputCreateUser = {
  username: string;
  password?: string;
  options: {
    // indicates creating admin user
    admin?: boolean;
  };
};

export type InputAdminDeleteUser = {
  id: number;
  username: string;
};

export type InputCheckPassword = {
  username: string;
  password: string;
};

export type InputChangePassword = {
  userId: number;
  currentPassword: string;
  newPassword: string;
};

export type InputBatchUpsertTagItem = { name: string };
export type InputBatchUpsertTag = {
  userId: number;
  items: InputBatchUpsertTagItem[];
};

export type InputCreateTag = {
  name: string;
  userId: number;
};

export type InputGetAllTags = {
  userId: UserId;
};

export type InputBatchGetTags = {
  userId: UserId;
  ids: number[];
};

export type InputUpdateTag = {
  id: number;
  userId: UserId;
  name: string;
};

export type InputUpdateGroup = {
  id: number;
  userId: number;
  name: string;
};

export const SchemaUpdateGroup = z.object({
  id: z.number().int(),
  userId: z.number().int(),
  name: z.string(),
});

export type InputDeleteTag = {
  id: number;
  userId: UserId;
};

export type InputDeleteGroup = {
  id: number;
  userId: number;
};

export type TagGetAllUserBookmarkInput = {
  userId: UserId;
  bookmarkId: BookmarkId;
};

export type TagFromDb = {
  id: number;
  name: string;
  count?: number;
};

export type BookmarkTagFromDb = {
  bookmarkId: BookmarkId;
  tagId: TagId;
};

export type InputCreateBookmarkTag = {
  bookmarkId: BookmarkId;
  tagId: TagId;
};
export type InputDeleteBookmarkTag = InputCreateBookmarkTag;
export type InputBatchUpsertBookmarkTag = {
  userId: number;
  items: Array<{ bookmarkId: number; tagId: number }>;
};

export type InputBatchUpsertGroupItem = { name: string };
export type InputBatchUpsertGroup = {
  userId: number;
  items: InputBatchUpsertGroupItem[];
};

export type InputCreateGroup = {
  userId: number;
  name: string;
};

export type InputGetAllGroups = {
  userId: number;
};

export const SchemaCreateGroup = z.object({
  userId: z.number().int(),
  name: z.string(),
});

export enum JobOperation {
  Export = 'export',
}

export enum JobStatus {
  Pending = 'PENDING',
  InProgress = 'IN_PROGRESS',
  Finished = 'FINISHED',
}

export type JobExportOutput = {
  filename: string;
  tagCount: number;
  groupCount: number;
  bookmarkCount: number;
};

export type JobFromDb = {
  id: number;
  userId: number;
  status: JobStatus;
  op: string;
  exp: number;
  input: string;
  output: string;
  error: string;
  createdAt: number;
  finishedAt: number;
};

export type BookmarkStashFromDb = {
  id: number;
  createdAt: number;
};

export type InputCreateJob = {
  user: User;
  op: string;
  exp: number;
  input: unknown;
};

export type InputAllJob = {
  userId?: number;
  op?: string;
  limit?: number;
};

export type InputUpdateJobOutput = {
  id: number;
  output: unknown;
};

export type InputUpdateJobError = {
  id: number;
  error: string;
};

export type InputDeleteManyJobs = {
  ids: number[];
};

export type InputAllBookmarkStash = {
  // userId?: number;
  limit?: number;
};
///// backend api

export type PageMetaBookmarks = { after?: string };
