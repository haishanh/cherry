<script context="module" lang="ts">
</script>

<script lang="ts">
  import SearchForm from '$lib/components/SearchForm.svelte';
  import type { BookmarkFromDb } from '$lib/type';

  export let bookmarks: BookmarkFromDb[] = [];
</script>

<div class="main">
  <SearchForm />
  <div class="list">
    {#each bookmarks as l}
      <a href={l.url} target="_blank" rel="noopener noreferrer">
        <img
          loading="lazy"
          src={`https://icons.duckduckgo.com/ip3/${new URL(l.url).hostname}.ico`}
          alt={'favicon of the site'}
        />
        {l.title}
      </a>
    {/each}
  </div>
</div>

<style lang="scss">
  .main {
    max-width: 1000px;
    padding: 15px;
    margin: 0 auto;
    font-size: 0.9em;
  }

  .list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    a {
      text-decoration: none;
      color: inherit;
      display: flex;
      align-items: center;
      gap: 10px;
      background-color: var(--bg-card);
      padding: 10px;
      border-radius: 300px;
    }
    img {
      width: 20px;
      height: 20px;
    }
  }
</style>
