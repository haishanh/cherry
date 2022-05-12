<script context="module" lang="ts">
</script>

<script lang="ts">
  import invariant from 'tiny-invariant';
  
  import BookmarkChip from '$lib/components/BookmarkChip.svelte';
  import SearchForm from '$lib/components/SearchForm.svelte';
  import type { BookmarkFromDb } from '$lib/type';

  import ToastList from './base/toast/ToastList.svelte';
  import Header from './feature/Header.svelte';

  export let bookmarks: BookmarkFromDb[] = [];

  // we only support restore last deleted
  const removed: { bookmark?: BookmarkFromDb; idx?: number } = {};

  function handleRemoveBookmark(e: CustomEvent<BookmarkFromDb>) {
    const bookmark = e.detail;
    const idx = bookmarks.findIndex((item) => item === bookmark);

    removed.bookmark = bookmark;
    removed.idx = idx;

    bookmarks.splice(idx, 1);
    bookmarks = bookmarks;
  }

  function handleRestoreBookmark(e: CustomEvent<number>) {
    if (!removed.bookmark) return;

    invariant(typeof removed.bookmark.id === typeof e.detail, 'both should be number');

    if (removed.bookmark.id !== e.detail) return;

    bookmarks.splice(removed.idx, 0, removed.bookmark);
    bookmarks = bookmarks;
    removed.bookmark = undefined;
  }
</script>

<Header />
<div class="main">
  <SearchForm />
  <div class="list">
    {#each bookmarks as bookmark (bookmark.id)}
      <BookmarkChip {bookmark} on:remove={handleRemoveBookmark} on:restore={handleRestoreBookmark} />
    {/each}
  </div>
  <ToastList />
</div>

<style lang="scss">
  .main {
    max-width: 1000px;
    margin: 0 auto;
    padding: 0 15px 15px;
  }

  .list {
    font-size: 0.9em;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
</style>
