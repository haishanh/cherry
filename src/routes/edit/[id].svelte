<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';

  export const load: Load = async (input) => {
    const fetch = input.fetch;
    const id = input.params.id;
    const res = await fetch('/api/bookmarks/' + id);
    if (res.ok) {
      const ret = await res.json();
      return {
        props: { bookmark: ret },
      };
    }
    return {
      status: res.status,
      error: new Error(`Could not load`),
    };
  };
</script>

<script lang="ts">
  import EditForm from '$lib/components/feature/EditForm.svelte';
  import type { BookmarkFromDb } from '$lib/type';

  export let bookmark: BookmarkFromDb;
</script>

<main>
  <h1>Edit</h1>
  <section>
    <EditForm {bookmark} />
  </section>
</main>

<style lang="scss">
  main {
    max-width: 900px;
    margin: 0 auto;
    padding: 15px;
  }

  section {
    margin: 16px 0;
  }
</style>
