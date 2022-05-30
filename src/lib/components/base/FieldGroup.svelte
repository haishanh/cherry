<script lang="ts">
  import GroupAutocomplete from '$lib/components/autocomplte/GroupAutocomplete.svelte';
  import type { TagType } from '$lib/type';
  import { makeId } from '$lib/utils/common.util';

  let id = '' + makeId();

  export let name = 'Group';
  export let options: TagType[] = [];
  export let group: { name: string; id: number } | null = null;
</script>

<div>
  <label for={id}>{name}</label>
  <GroupAutocomplete {id} {options} bind:group canCreate={true} />
</div>

<style lang="scss">
  label {
    line-height: 1.8;
  }
</style>
