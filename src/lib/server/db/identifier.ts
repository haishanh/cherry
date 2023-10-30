export const Table = {
  Bookmark: { name: 'bookmark' },
  Group: { name: 'cherry_group' },
  Tag: { name: 'tag' },
  User: { name: 'user' },
  BookmarkTag: { name: 'bookmark_tag' },
  BookmarkFts: { name: 'bookmark_fts' },
  BookmarkStash: { name: 'bookmark_stash' },
  Job: { name: 'job' },
} as const;
type TableName = keyof typeof Table;
export type TableItem = (typeof Table)[TableName];

// loose typed (but TableItem is strictly typed)
export type ColumnItem = {
  name: string;
  table?: TableItem;
};

const bookmark_column: (name: string) => ColumnItem = (name) => ({ name, table: Table.Bookmark });
const bookmark_tag_column: (name: string) => ColumnItem = (name) => ({ name, table: Table.BookmarkTag });
const bookmark_fts_column: (name: string) => ColumnItem = (name) => ({ name, table: Table.BookmarkFts });
const bookmark_stash_column: (name: string) => ColumnItem = (name) => ({ name, table: Table.BookmarkStash });
const tag_column: (name: string) => ColumnItem = (name) => ({ name, table: Table.Tag });
const group_column: (name: string) => ColumnItem = (name) => ({ name, table: Table.Group });
const job_column: (name: string) => ColumnItem = (name) => ({ name, table: Table.Job });

export const Column = {
  Bookmark: {
    Id: bookmark_column('id'),
    UserId: bookmark_column('userId'),
    Title: bookmark_column('title'),
    Desc: bookmark_column('desc'),
    Url: bookmark_column('url'),
    GroupId: bookmark_column('groupId'),
    CreatedAt: bookmark_column('createdAt'),
    UpdatedAt: bookmark_column('updatedAt'),
  },
  BookmarkFts: {
    RowId: bookmark_fts_column('rowid'),
    Rank: bookmark_fts_column('rank'),
    // fts field name is the name of the table
    Fts: { name: 'bookmark_fts' },
  },
  BookmarkTag: {
    BookmarkId: bookmark_tag_column('bookmarkId'),
    TagId: bookmark_tag_column('tagId'),
  },
  BookmarkStash: {
    Id: bookmark_stash_column('id'),
    Key: bookmark_stash_column('key'),
    UserId: bookmark_stash_column('userId'),
    Data: bookmark_stash_column('data'),
    CreatedAt: bookmark_stash_column('createdAt'),
  },
  Tag: {
    Id: tag_column('id'),
    UserId: tag_column('userId'),
    Name: tag_column('name'),
    Count: tag_column('count'),
  },
  Group: {
    Id: group_column('id'),
    UserId: group_column('userId'),
    Name: group_column('name'),
    Count: group_column('count'),
  },
  Job: {
    Id: job_column('id'),
    UserId: job_column('userId'),
    Op: job_column('op'),
    Status: job_column('status'),
    Exp: job_column('exp'),
    Input: job_column('input'),
    Output: job_column('output'),
    Error: job_column('error'),
    CreatedAt: job_column('createdAt'),
    FinishedAt: job_column('finishedAt'),
  },
} as const;
