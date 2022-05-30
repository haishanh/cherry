<script lang="ts">
  import AutocompleteForm from '$lib/components/autocomplte/AutocompleteForm.svelte';
  import type { TagType } from '$lib/components/autocomplte/type';

  const allTags: TagType[] = [
    { id: 1, name: 'White' },
    { id: 2, name: 'Red' },
    { id: 3, name: 'Yellow' },
    { id: 4, name: 'Green' },
    { id: 5, name: 'Blue' },
    { id: 6, name: 'Black' },
  ];

  let tags: TagType[] = [{ id: 100, name: 'Hello' }];
</script>

<main>
  <section>
    <pre>{JSON.stringify(tags, null, 2)}</pre>
  </section>
  <section>
    <AutocompleteForm options={allTags} bind:tags />
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

    max-width: 600px;
    margin: 16px auto;
  }
</style>
