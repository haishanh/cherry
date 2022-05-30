<script lang="ts">
  import Home from '$lib/components/Home.svelte';
  import type { BookmarkFromDb } from '$lib/type';

  import type { PageData } from './$types';

  export let data: PageData;

  let bookmarks: BookmarkFromDb[] = [];
  let meta: { after?: string } = {};
  let totalPage: number;
  let url: { pathname: string; search: string };

  $: {
    bookmarks = data.bookmarks;
    meta = data.meta;
    totalPage = data.totalPage;
    url = data.url;
  }
</script>

<svelte:head>
  <title>Cherry</title>
</svelte:head>
<Home {bookmarks} {meta} {totalPage} {url} />
