<script lang="ts">
  export let value = 'input';
  export let name = 'name';
  export let id = 'name';
  export let placeholder = '';
  export let error = '';
  export let type = 'text';
</script>

<input {id} {name} {type} {placeholder} class:error {value} on:input />

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
