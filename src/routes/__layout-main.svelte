
<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';

  export const load: Load = async (input) => {
    const fetch = input.fetch;

    const qs0 = input.url.searchParams;
    const q0 = qs0.get('q');
    // rebuild this to ensure we only include what we want
    const qs1 = new URLSearchParams({ q: q0 });

    let res: Response;
    if (q0) {
      res = await fetch(`/api/search?${qs1}`);
    } else {
      res = await fetch('/api/bookmarks');
    }

    if (res.ok) {
      const bookmarks = await res.json();
      return { props: { bookmarks } };
    }

    return {
      status: res.status,
      error: new Error(`Could not load`),
    };
  };
</script>

<script lang="ts">
  import '../app.scss';

  import type { BookmarkFromDb } from '$lib/type';
  import SearchForm from '$lib/components/SearchForm.svelte';

  export let bookmarks: BookmarkFromDb[] = [];
</script>

<div class="main">
  <SearchForm />
  <div class="list">
    {#each bookmarks as l}
      <a href={l.url} target="_blank" rel="noopener noreferrer">
        <img loading="lazy" src={`https://icons.duckduckgo.com/ip3/${new URL(l.url).hostname}.ico`} alt={'favicon of the site'} />
        {l.title}
      </a>
    {/each}
  </div>
</div>


<style lang="scss">
  @font-face {
    font-family: 'Inter';
    font-style: normal;
    font-weight: 400;
    font-display: swap;
    // prettier-ignore
    src: local('Inter-Regular'), url('../assets/interJD5f6rvu.woff2') format('woff2'), url('../assets/interJD5f6rvu.woff') format('woff');
  }
  @font-face {
    font-family: 'Inter';
    font-style: normal;
    font-weight: 800;
    font-display: swap;
    // prettier-ignore
    src: local('Inter-ExtraBold'), url('../assets/interIoAYgYqv.woff2') format('woff2'), url('../assets/interIoAYgYqv.woff') format('woff');
  }

  @mixin dark {
    --bg-main: #050505;
    --bg-card: #1d1d1f;
    --color-text: #ddd;
  }
  @mixin light {
    --bg-main: #f3f3f3;
    --bg-card: #fefefe;
    --color-text: #222;
  }

  :global(:root) {
    @media (prefers-color-scheme: dark) {
      @include dark;
      color-scheme: dark;
    }
    @media (prefers-color-scheme: light) {
      @include light;
      color-scheme: light;
    }
  }

  :global(body, html) {
    margin: 0;
    padding: 0;
  }
  :global(button) {
    user-select: none;
  }

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
