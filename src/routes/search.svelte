<script context="module" lang="ts">
  export { load } from '$lib/server/load/home.load';
</script>

<script lang="ts">
  import type { BookmarkFromDb } from '$lib/type';
  import Home from '$lib/components/Home.svelte';

  export let bookmarks: BookmarkFromDb[] = [];
</script>

<Home {bookmarks} />

<style lang="scss">
</style>
