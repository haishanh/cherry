<script lang="ts">
  export let value = 'input';
  export let id = 'name';
  export let placeholder = '';
</script>

<input {id} {placeholder} type="text" bind:value />

<style lang="scss">
  input {
    height: 40px;
    width: 100%;
    margin: 1px 0;
    padding: 15px 10px;
    outline: none;
    border-radius: 7px;
    font-size: inherit;
    border: 1px solid var(--color-input-bo);
    &:hover {
      border-color: var(--color-input-bo-hover);
    }
    &:focus {
      border-color: var(--color-focus-blue);
    }
  }
</style>
