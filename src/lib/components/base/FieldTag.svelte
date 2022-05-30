<script lang="ts">
  import type { TagType } from '$lib/type';
  import { makeId } from '$lib/utils/common.util';

  import TagAutocomplete from '../autocomplte/TagAutocomplete.svelte';

  let id = '' + makeId();

  export let name = 'Tags';
  export let options: TagType[] = [];
  export let tags: TagType[] = [];
</script>

<div>
  <label for={id}>{name}</label>
  <TagAutocomplete {options} bind:tags canCreate={true} autoSelect={true} />
</div>

<style lang="scss">
  label {
    line-height: 1.8;
  }
</style>
