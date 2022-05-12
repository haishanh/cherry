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
  export let meta: { next?: string } = {};

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
  {#if meta && meta.next}
    <div class="pagination">
      <a href={'/?next=' + meta.next}>Next</a>
    </div>
  {/if}
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
  .pagination {
    padding: 25px 5px;
    text-align: right;
    a {
      color: inherit;
      border: 1px solid transparent;
      padding: 10px 16px;
      border-radius: 200px;
      @media (prefers-color-scheme: dark) {
        --lightness: 30%;
      }
      @media (prefers-color-scheme: light) {
        --lightness: 50%;
      }
      &:hover {
        border-color: hsl(0deg 0% var(--lightness));
        background-color: var(--bg-card);
      }
    }
  }
</style>
