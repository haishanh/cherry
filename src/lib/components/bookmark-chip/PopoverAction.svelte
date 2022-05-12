<script lang="ts">
  import Edit from '@hsjs/svelte-icons/feather/Edit.svelte';
  import Trash from '@hsjs/svelte-icons/feather/Trash.svelte';
  import CloseIcon from '@hsjs/svelte-icons/feather/X.svelte';
  import { createEventDispatcher } from 'svelte';

  import Button from '$lib/components/base/Button.svelte';

  const dispatch = createEventDispatcher();

  const emit = (event: string) => () => dispatch(event);

  // focus the first button on mount
  function focus0(node: HTMLDivElement) {
    const btn = node.querySelector('button') as HTMLButtonElement;
    requestAnimationFrame(() => {
      btn && btn.focus({ preventScroll: true });
    });
  }
</script>

<div class="action" use:focus0>
  <Button kind="icon" title="View and Edit" on:click={emit('edit')}>
    <span class="vh">View and Edit</span><Edit size={14} />
  </Button>
  <Button kind="icon" title="Delete" on:click={emit('delete')}>
    <span class="vh">Delete</span><Trash size={14} />
  </Button>
  <Button kind="icon" title="Close" on:click={emit('close')}>
    <span class="vh">Close</span><CloseIcon size={14} />
  </Button>
</div>

<style lang="scss">
  .action {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }

  .vh {
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    height: 1px;
    overflow: hidden;
    position: absolute;
    white-space: nowrap;
    width: 1px;
  }
</style>
