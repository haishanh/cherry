<script lang="ts">
  import SearchForm from '$lib/components/SearchForm.svelte';
  import type { TagType } from '$lib/type';

  const options: TagType[] = [
    { id: 1, name: '1White' },
    { id: 2, name: '2Red' },
    { id: 3, name: '3Yellow' },
    { id: 4, name: '4Green' },
    { id: 5, name: '5Blue' },
    { id: 6, name: '6Black' },
    { id: 7, name: '7Pink' },
    { id: 8, name: '8Cyan' },
  ];

  const noop = () => {};
  let tags: TagType[] = [{ id: 100, name: 'Hello' }];
</script>

<main>
  <section>
    <pre>{JSON.stringify(tags, null, 2)}</pre>
  </section>
  <section>
    <SearchForm dryrun focus0={noop} blur0={noop} />
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
