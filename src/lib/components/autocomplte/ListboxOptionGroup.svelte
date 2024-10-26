<script lang="ts">
  export let item: { name: string; id?: number };
  
  import { FolderIcon } from 'lucide-svelte';

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
