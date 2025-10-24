<script lang="ts">
  import Button from '$lib/components/base/Button.svelte';
  import VisuallyHidden from '$lib/components/base/VisuallyHidden.svelte';
  import { SquarePen, TrashIcon, XIcon } from '@lucide/svelte';

  type Props = {
    onedit: () => void;
    ondelete: () => void;
    onclose: () => void;
  };

  let { onclose, onedit, ondelete }: Props = $props();

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
              onclose();
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
  <Button modifier={['icon']} title="View and Edit" onclick={() => onedit()}>
    <VisuallyHidden>View and Edit</VisuallyHidden><SquarePen size={14} />
  </Button>
  <Button modifier={['icon']} title="Delete" onclick={() => ondelete()}>
    <VisuallyHidden>Delete</VisuallyHidden><TrashIcon size={14} />
  </Button>
  <Button modifier={['icon']} title="Close" onclick={() => onclose()}>
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
