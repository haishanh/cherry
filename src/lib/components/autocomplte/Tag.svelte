<script lang="ts">
  import CloseIcon from '@hsjs/svelte-icons/feather/X.svelte';
  import VisuallyHidden from '$lib/components/base/VisuallyHidden.svelte';

  export let name: string;

  export let color: string | number = 0;

  export let hasClose = false;

  const colorMap = {
    '0': 'color:#14551B;background:#ADF29B;',
    '1': 'color:#65670F;background:#E6E97B;',
    '2': 'color:#6C0E58;background:#FFAAD3;',
    '3': 'color:var(--color-text);background:hsl(0deg 0% 97%);border-color:hsl(0deg 0% 80%);',
    '4': 'color: #b0cfff;background: #103062;border-color: #6bb3ff;',
  };
</script>

<span class="tag" class:hasClose style={colorMap[color]}>
  <span>
    {name}
  </span>
  <button on:click={() => {}}>
    <VisuallyHidden>Remove this tag</VisuallyHidden><CloseIcon size={14} />
  </button>
</span>

<style lang="scss">
  .tag {
    background-color: #ccc;
    border-radius: 100px;
    padding: 5px 8px;
    font-size: 0.9em;
    border: 1px solid transparent;
    font-weight: 800;
    display: inline-flex;
    align-items: center;
    &.hasClose {
      padding-left: 13px;
    }
  }
  button {
    margin-left: 2px;
    appearance: none;
    outline: none;
    user-select: none;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 100px;
    background: none;
    color: inherit;
    border: 1px solid transparent;
    padding: 2px;
    &:hover {
      border-color: currentColor;
    }
    &:active {
      transform: scale(0.97);
    }
  }
</style>
