<script lang="ts">
  import TextInput from '$lib/components/base/TextInput.svelte';
  import { makeId } from '$lib/utils/common.util';

  let id = '' + makeId();

  export let name = 'Field Name';
  export let value = '';
  export let placeholder = 'placeholder';
</script>

<div>
  <label for={id}>{name}</label>
  <TextInput {id} {placeholder} bind:value />
</div>

<style lang="scss">
  div {
    margin: 5px 0;
  }
  label {
    line-height: 1.8;
  }
</style>
