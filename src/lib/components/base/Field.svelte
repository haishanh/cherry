<script lang="ts">
  import TextArea from '$lib/components/base/TextArea.svelte';
  import TextInput from '$lib/components/base/TextInput.svelte';
  import { makeId } from '$lib/utils/common.util';

  let id = '' + makeId();

  type Props = {
    label?: string;
    name?: string;
    value?: string;
    placeholder?: string;
    type?: string;
    error?: string;
  };

  let { label = '', name = '', value = $bindable(''), placeholder = '', type = '', error = '' }: Props = $props();

  function handleInputOnInput(e: Event) {
    const target = e.target as HTMLInputElement;
    value = target.value;
    error = '';
  }
</script>

<div class="root">
  <label for={id}>{label || name}</label>
  {#if type === 'textarea'}
    <TextArea {id} {placeholder} bind:value />
  {:else}
    <TextInput {id} {type} {name} {error} {placeholder} {value} oninput={handleInputOnInput} />
  {/if}
  {#if error}
    <div class="msg error">{error}</div>
  {/if}
</div>

<style lang="scss">
  label {
    line-height: 1.8;
  }
  .msg {
    font-size: 12px;
    height: 13px;
    margin-top: 2px;
    line-height: 1;
  }
  .error {
    // color: #e30000;
    color: hsl(0deg 84% 61%);
  }
</style>
