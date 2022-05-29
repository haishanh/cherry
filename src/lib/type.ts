export type BookmarkFromDb = {
  id: number;
  title: string;
  desc: string;
  url: string;
  updatedAt?: number;
};

export type BookmarkCreateDto = {
  url: string;
  title?: string;
  desc?: string;
};

export type BookmarkUpdateDto = {
  id: string;
  userId: string | number;
  url?: string;
  title?: string;
  desc?: string;
};

export type BookmarkGetDto = {
  id: string | number;
  userId: string | number;
};

export type BookmarkDeleteDto = BookmarkGetDto;

export type BookmarkStashDto = BookmarkDeleteDto;
export type BookmarkRestoreDto = BookmarkDeleteDto;

export type BookmarkGetAllOpts = {
  userId: number;
  after?: { updatedAt: number; id: number };
};

export type UserCreateDto = {
  username: string;
  // password?: string;
  isAdmin?: number;
};
