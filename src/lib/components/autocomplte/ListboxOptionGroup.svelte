<script lang="ts">
  export let item: { name: string; id?: number };

  import Folder from '@hsjs/svelte-icons/feather/Folder.svelte';
</script>

<span class="tag-label"><Folder size={18} /><span>{item.name}</span></span>
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
