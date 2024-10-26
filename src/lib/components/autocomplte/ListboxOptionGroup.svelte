<script lang="ts">
  import { FolderIcon } from 'lucide-svelte';
  interface Props {
    item: { name: string; id?: number };
  }

  let { item }: Props = $props();
</script>

<span class="tag-label"><FolderIcon size={17} /><span>{item.name}</span></span>
{#if !('id' in item)}
  <span>New group</span>
{/if}

<style lang="scss">
  .tag-label {
    display: flex;
    align-items: center;
    span {
      margin-left: 5px;
    }
  }
</style>
