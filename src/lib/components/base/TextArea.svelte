<script lang="ts">
  export let value = 'input';
  export let id = 'name';
  export let placeholder = '';
</script>

<textarea {id} {placeholder} rows={3} bind:value></textarea>

<style lang="scss">
  textarea {
    width: 100%;
    resize: vertical;
    padding: 15px 10px;
    outline: none;
    border-radius: 7px;
    font-family: inherit;
    font-size: inherit;

    background-color: var(--color-input-bg);
    border: 1px solid var(--color-input-bo);
    &:hover {
      border-color: var(--color-input-bo-hover);
    }
    &:focus {
      box-shadow: var(--focus-shadow);
    }
  }
</style>
