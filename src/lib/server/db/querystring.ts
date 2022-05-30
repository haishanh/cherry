export const BookmarkTagQueryDeleteV0 = `delete from bookmark_tag where bookmarkId = @bookmarkId and tagId = @tagId`;
export const BookmarkTagQueryInsertV0 =
  'insert or ignore into bookmark_tag (bookmarkId, tagId) values (@bookmarkId, @tagId)';
