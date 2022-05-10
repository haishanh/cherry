<script context="module" lang="ts">
</script>

<script lang="ts">
  import SearchForm from '$lib/components/SearchForm.svelte';
  import BookmarkChip from '$lib/components/BookmarkChip.svelte';
  import type { BookmarkFromDb } from '$lib/type';

  export let bookmarks: BookmarkFromDb[] = [];
</script>

<div class="main">
  <SearchForm />
  <div class="list">
    {#each bookmarks as bookmark}
      <BookmarkChip {bookmark} />
    {/each}
  </div>
</div>

<style lang="scss">
  .main {
    max-width: 1000px;
    padding: 0 15px 15px;
    margin: 0 auto;
  }

  .list {
    font-size: 0.9em;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
</style>
