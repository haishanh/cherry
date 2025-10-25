<script lang="ts">
  import TagAutocomplete from '$lib/components/autocomplte/TagAutocomplete.svelte';
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

  let tags: TagType[] = $state([{ id: 100, name: 'Hello' }]);
  let tags2: TagType[] = $state([]);
  let tags3: TagType[] = $state([]);

  let inputValue = $state('');
  let inputValue2 = $state('');
  let inputValue3 = $state('');
</script>

<main>
  <h2>With prefilled</h2>
  <section>
    <pre>{JSON.stringify(tags, null, 2)}</pre>
  </section>
  <section>
    <TagAutocomplete {options} bind:tags canCreate={false} bind:inputValue />
  </section>
  <h2>With autoSelect=false</h2>
  <section>
    <TagAutocomplete {options} bind:tags={tags2} autoSelect={false} canCreate={false} bind:inputValue={inputValue2} />
  </section>
  <h2>With autoSelect=true</h2>
  <section>
    <TagAutocomplete {options} bind:tags={tags3} autoSelect={true} canCreate={false} bind:inputValue={inputValue3} />
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
