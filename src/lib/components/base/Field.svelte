<script lang="ts">
  import TextArea from '$lib/components/base/TextArea.svelte';
  import TextInput from '$lib/components/base/TextInput.svelte';
  import { makeId } from '$lib/utils/common.util';

  let id = '' + makeId();

  export let name = 'Field Name';
  export let value = '';
  export let placeholder = 'placeholder';
  export let type: string | null = null;
</script>

<div>
  <label for={id}>{name}</label>
  {#if type === 'textarea'}
    <TextArea {id} {placeholder} bind:value />
  {:else}
    <TextInput {id} {placeholder} bind:value />
  {/if}
</div>

<style lang="scss">
  div {
    margin: 5px 0;
  }
  label {
    line-height: 1.8;
  }
</style>
