<script lang="ts">
  import { XIcon as CloseIcon } from '@lucide/svelte';

  import VisuallyHidden from '$lib/components/base/VisuallyHidden.svelte';

  interface Props {
    color?: keyof typeof colorMap;
    hasClose?: boolean;
    tag: { name: string };
    clickclose: (tag: { name: string }) => void;
  }

  let { color = '1', hasClose = true, tag, clickclose }: Props = $props();

  const colorMap = {
    '0': 'color:#14551B;background:#ADF29B;',
    '1': 'color:var(--accent);background-color:hsla(94deg, 99%, 33%, 0.2)',
    '2': 'color:#6C0E58;background:#FFAAD3;',
    '3': 'color:var(--color-text);background:hsl(0deg 0% 97%);border-color:hsl(0deg 0% 80%);',
  };
</script>

<span class="tag" class:hasClose style={colorMap[color]}>
  <span>{tag.name}</span>
  {#if hasClose}
    <button type="button" onmousedown={() => clickclose(tag)}>
      <VisuallyHidden>Remove this tag</VisuallyHidden><CloseIcon size={14} />
    </button>
  {/if}
</span>

<style lang="scss">
  .tag {
    background-color: #ccc;
    border-radius: 100px;
    padding: 4px 8px;
    font-size: 0.9em;
    border: 1px solid transparent;
    line-height: 1;
    display: inline-flex;
    align-items: center;
  }
  button {
    margin-left: 1px;
    margin-right: -5px;
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
