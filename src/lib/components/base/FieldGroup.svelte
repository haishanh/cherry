<script lang="ts">
  import GroupAutocomplete from '$lib/components/autocomplte/GroupAutocomplete.svelte';
  import type { TagType } from '$lib/type';
  import { makeId } from '$lib/utils/common.util';

  let id = '' + makeId();

  type Props = {
    name?: string;
    options: TagType[];
    group: { name: string; id: number } | null;
  };

  let { name = 'Group', options = [], group = $bindable(null) }: Props = $props();
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
