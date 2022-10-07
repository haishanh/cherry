<script lang="ts" context="module">
  export enum EVENT_TYPE {
    ClickArrangeButton,
    ClickAddButton,
  }
</script>

<script lang="ts">
  import Edit from '@hsjs/svelte-icons/feather/Edit.svelte';
  import Plus from '@hsjs/svelte-icons/feather/Plus.svelte';
  import { createEventDispatcher } from 'svelte';

  import Button from '$lib/components/base/Button.svelte';
  import Tooltip from '$lib/components/base/popover/Tooltip.svelte';
  import VisuallyHidden from '$lib/components/base/VisuallyHidden.svelte';

  export let tools = ['arrange', 'add'];

  const dispatch = createEventDispatcher();

  function handleClickArrangeBookmarksButton() {
    dispatch('ev0', { type: EVENT_TYPE.ClickArrangeButton });
  }
  function handleClickAddButton() {
    dispatch('ev0', { type: EVENT_TYPE.ClickAddButton });
  }
</script>

<div class="toolbar">
  {#each tools as tool (tool)}
    {#if tool === 'arrange'}
      <Tooltip>
        <Button slot="trigger" modifier={['icon']} on:click={handleClickArrangeBookmarksButton}>
          <Edit size={16} />
          <VisuallyHidden>Bulk Edit</VisuallyHidden>
        </Button>
        <div class="tooltip-cnt" slot="content">Bulk Edit</div>
      </Tooltip>
    {:else if tool === 'add'}
      <Tooltip>
        <Button slot="trigger" modifier={['icon']} on:click={handleClickAddButton}>
          <Plus size={16} />
          <VisuallyHidden>Add New Bookmark</VisuallyHidden>
        </Button>
        <div class="tooltip-cnt" slot="content">Add New Bookmark</div>
      </Tooltip>
    {/if}
  {/each}
</div>

<style lang="scss">
  .toolbar {
    padding: 8px 0;
    display: flex;
    justify-content: flex-end;
    gap: 5px;
  }
  .tooltip-cnt {
    font-size: 0.85em;
  }
</style>
