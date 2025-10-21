<script lang="ts">
  type Props = {
    value?: string;
    id?: string;
    placeholder?: string;
  };
  let { value = $bindable('input'), id = 'name', placeholder = '' }: Props = $props();
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
