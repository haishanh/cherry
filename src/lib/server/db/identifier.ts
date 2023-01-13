export const Table = {
  Bookmark: { name: 'bookmark' },
  Group: { name: 'cherry_group' },
  Tag: { name: 'tag' },
  User: { name: 'user' },
  BookmarkTag: { name: 'bookmark_tag' },
  BookmarkFts: { name: 'bookmark_fts' },
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
} as const;
