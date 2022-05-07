<script context="module" lang="ts">
  export { load } from '$lib/server/load/home.load';
</script>

<script lang="ts">
  import Home from '$lib/components/Home.svelte';
  import type { BookmarkFromDb } from '$lib/type';

  export let bookmarks: BookmarkFromDb[] = [];
</script>

<Home {bookmarks} />

<style lang="scss">
</style>
