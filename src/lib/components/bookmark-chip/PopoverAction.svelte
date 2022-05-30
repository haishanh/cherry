<script lang="ts">
  import Edit from '@hsjs/svelte-icons/feather/Edit.svelte';
  import Trash from '@hsjs/svelte-icons/feather/Trash.svelte';
  import CloseIcon from '@hsjs/svelte-icons/feather/X.svelte';
  import { createEventDispatcher } from 'svelte';

  import Button from '$lib/components/base/Button.svelte';
  import VisuallyHidden from '$lib/components/base/VisuallyHidden.svelte';

  const dispatch = createEventDispatcher();

  const emit = (event: string) => () => dispatch(event);

  // trap focus and focus the first button on mount
  function focus0(node: HTMLDivElement) {
    const buttons = Array.from(node.querySelectorAll('button')) as HTMLButtonElement[];
    const first = buttons[0];
    const last = buttons[buttons.length - 1];

    requestAnimationFrame(() => {
      first && first.focus({ preventScroll: true });
    });

    function handleWindowOnKeydown(event: KeyboardEvent) {
      switch (event.key) {
        case 'Tab':
          {
            if (!event.shiftKey && document.activeElement === last && first !== last) {
              event.preventDefault();
              first.focus();
            } else if (event.shiftKey && document.activeElement === first && first !== last) {
              event.preventDefault();
              last.focus();
            }
          }
          break;
        case 'Escape':
          {
            const active = document.activeElement as HTMLButtonElement;
            if (buttons.includes(active) && 'blur' in active) {
              event.preventDefault();
              emit('close')();
            }
          }
          break;
      }
      return;
    }

    window.addEventListener('keydown', handleWindowOnKeydown);
    return {
      destroy: () => {
        window.removeEventListener('keydown', handleWindowOnKeydown);
      },
    };
  }
</script>

<div class="action" use:focus0>
  <Button modifier={['icon']} title="View and Edit" on:click={emit('edit')}>
    <VisuallyHidden>View and Edit</VisuallyHidden><Edit size={14} />
  </Button>
  <Button modifier={['icon']} title="Delete" on:click={emit('delete')}>
    <VisuallyHidden>Delete</VisuallyHidden><Trash size={14} />
  </Button>
  <Button modifier={['icon']} title="Close" on:click={emit('close')}>
    <VisuallyHidden>Close</VisuallyHidden><CloseIcon size={14} />
  </Button>
</div>

<style lang="scss">
  .action {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
</style>
