<script context="module" lang="ts">
</script>

<script lang="ts">
  import BookmarkChip from '$lib/components/BookmarkChip.svelte';
  import SearchForm from '$lib/components/SearchForm.svelte';
  import type { BookmarkFromDb } from '$lib/type';

  import ToastList from './base/toast/ToastList.svelte';

  export let bookmarks: BookmarkFromDb[] = [];

  function handleRemoveBookmark(e: CustomEvent<BookmarkFromDb>) {
    const bookmark = e.detail;
    const idx = bookmarks.findIndex((item) => item === bookmark);
    console.log(idx, 'removed');
    bookmarks.splice(idx, 1);
    bookmarks = bookmarks;
  }
</script>

<div class="main">
  <SearchForm />
  <div class="list">
    {#each bookmarks as bookmark}
      <BookmarkChip {bookmark} on:remove={handleRemoveBookmark} />
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
