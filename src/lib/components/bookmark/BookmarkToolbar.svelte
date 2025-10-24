<script lang="ts" module>
  export enum EVENT_TYPE {
    ClickArrangeButton,
    ClickAddButton,
  }
</script>

<script lang="ts">
  import Button from '$lib/components/base/Button.svelte';
  import Tooltip from '$lib/components/base/popover/Tooltip.svelte';
  import VisuallyHidden from '$lib/components/base/VisuallyHidden.svelte';
  import { SquarePen, PlusIcon } from '@lucide/svelte';

  type Props = {
    ev0: (event: { type: EVENT_TYPE }) => void;
    tools?: string[];
  };

  let { ev0, tools = ['arrange', 'add'] }: Props = $props();

  function handleClickArrangeBookmarksButton() {
    ev0({ type: EVENT_TYPE.ClickArrangeButton });
  }
  function handleClickAddButton() {
    ev0({ type: EVENT_TYPE.ClickAddButton });
  }
</script>

<div class="toolbar">
  {#each tools as tool (tool)}
    {#if tool === 'arrange'}
      <Tooltip>
        {#snippet trigger()}
          <Button modifier={['icon']} onclick={handleClickArrangeBookmarksButton}>
            <SquarePen size={16} />
            <VisuallyHidden>Bulk Edit</VisuallyHidden>
          </Button>
        {/snippet}
        {#snippet content()}
          <div class="tooltip-cnt">Bulk Edit</div>
        {/snippet}
      </Tooltip>
    {:else if tool === 'add'}
      <Tooltip>
        {#snippet trigger()}
          <Button modifier={['icon']} onclick={handleClickAddButton}>
            <PlusIcon size={16} />
            <VisuallyHidden>Add New Bookmark</VisuallyHidden>
          </Button>
        {/snippet}
        {#snippet content()}
          <div class="tooltip-cnt">Add New Bookmark</div>
        {/snippet}
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
