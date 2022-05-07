<script lang="ts">
  import TextInput from '$lib/components/base/TextInput.svelte';
  import { genId } from '$lib/utils/common.util';

  let id = '' + genId();

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
