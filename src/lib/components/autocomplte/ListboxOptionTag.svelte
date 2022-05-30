<script lang="ts">
  export let item: { name: string; id?: number };

  import TagIcon from '@hsjs/svelte-icons/feather/Tag.svelte';
</script>

<span class="tag-label"><TagIcon size={18} /><span>{item.name}</span></span>
{#if !('id' in item)}
  <span>New tag</span>
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
