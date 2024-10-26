<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  import Button from '$lib/components/base/Button.svelte';
  import VisuallyHidden from '$lib/components/base/VisuallyHidden.svelte';
  import { EditIcon, TrashIcon, XIcon } from 'lucide-svelte';

  const dispatch = createEventDispatcher();

  const emit = (event: string) => () => dispatch(event);

  // trap focus and focus the first button on mount
  function focus0(node: HTMLDivElement) {
    const buttons = Array.from(node.querySelectorAll('button')) as HTMLButtonElement[];
    const first = buttons[0];
    const last = buttons[buttons.length - 1];

    requestAnimationFrame(() => {
      if (first) first.focus({ preventScroll: true });
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
  <Button modifier={['icon']} title="View and Edit" onclick={emit('edit')}>
    <VisuallyHidden>View and Edit</VisuallyHidden><EditIcon size={14} />
  </Button>
  <Button modifier={['icon']} title="Delete" onclick={emit('delete')}>
    <VisuallyHidden>Delete</VisuallyHidden><TrashIcon size={14} />
  </Button>
  <Button modifier={['icon']} title="Close" onclick={emit('close')}>
    <VisuallyHidden>Close</VisuallyHidden><XIcon size={14} />
  </Button>
</div>

<style lang="scss">
  .action {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
</style>
