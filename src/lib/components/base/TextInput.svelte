<script lang="ts">
  import type { FormEventHandler } from 'svelte/elements';

  type Props = {
    value?: string;
    name?: string;
    id?: string;
    placeholder?: string;
    error?: string;
    type?: string;
    oninput?: FormEventHandler<HTMLInputElement>;
  };

  let {
    value = $bindable('input'),
    name = 'name',
    id = 'name',
    placeholder = '',
    error = '',
    type = 'text',
    oninput = () => {},
  }: Props = $props();
</script>

<input {id} {name} {type} {placeholder} class:error {value} {oninput} />

<style lang="scss">
  input {
    height: 40px;
    width: 100%;
    padding: 15px 10px;
    outline: none;
    border-radius: 7px;
    font-size: inherit;
    border: 1px solid var(--color-input-bo);
    background-color: var(--color-input-bg);
    &:hover {
      border-color: var(--color-input-bo-hover);
    }
    &:focus {
      box-shadow: var(--focus-shadow);
    }
  }
  .error {
    --red: hsl(0deg 84% 61%);
    color: var(--red);
    border-color: var(--red);
    &:hover {
      border-color: var(--red);
    }
  }
</style>
