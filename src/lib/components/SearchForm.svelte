<script lang="ts">
  export let dryrun = false;

  import { onMount } from 'svelte';

  import { afterNavigate, goto } from '$app/navigation';
  import { log } from '$lib/client/logger.util';
  import { fetchTags, tagList, tagMapById } from '$lib/client/tag.store';
  import TagAutocomplete from '$lib/components/autocomplte/TagAutocomplete.svelte';
  import type { TagType } from '$lib/type';

  let tags: TagType[] = [];
  let inputValue = '';

  function updateState() {
    const search = new URL(document.location.href).searchParams;
    const qStr = search.get('q');
    const tagStr = search.get('tag');
    qStr ? (inputValue = qStr) : (inputValue = '');
    if (tagStr && $tagMapById.size > 0) {
      tags = tagStr
        .split(',')
        .map((s) => parseInt(s, 10))
        .map((n) => $tagMapById.get(n))
        .filter((x) => !!x);
    } else {
      tags = [];
    }
  }

  onMount(() => {
    fetchTags({ initial: true }).then(updateState);
  });

  afterNavigate(updateState);

  function onSubmit() {
    const q = (inputValue || '').trim();
    const tag = tags.map((t) => t.id).join(',');
    const o: { q?: string; tag?: string } = {};
    if (q) o.q = q;
    if (tag) o.tag = tag;
    const qs = new URLSearchParams(o);
    const url = `/?${qs}`;
    if (!dryrun) {
      goto(url);
    } else {
      log(url);
    }
  }
</script>

<form on:submit|preventDefault={onSubmit}>
  <TagAutocomplete
    options={$tagList}
    bind:tags
    canCreate={false}
    search
    bind:inputValue
    placeholder="Search"
    on:focus0
    on:blur0
  />
</form>

<style lang="scss">
  form {
    padding: 0 15px;
  }
</style>
