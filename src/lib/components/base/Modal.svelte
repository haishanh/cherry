<script lang="ts">
  import CloseIcon from '@hsjs/svelte-icons/feather/X.svelte';
  import { fly } from 'svelte/transition';
  // import { quintOut } from "svelte/easing";
  import { fade } from 'svelte/transition';

  import Button from '$lib/components/base/Button.svelte';
  import VisuallyHidden from '$lib/components/base/VisuallyHidden.svelte';

  let isOpen = false;

  export function open() {
    isOpen = true;
  }
  export function close() {
    isOpen = false;
  }

  // function handleClickOverlay(event: MouseEvent) {
  //   const overlay = ( event.currentTarget  as HTMLElement);
  //   const target = (event.target as HTMLElement);
  //   if (overlay.contains(target)) return;
  // }

  function focus0(node: HTMLDivElement) {
    const btn = node.querySelector('button') as HTMLButtonElement;
    requestAnimationFrame(() => {
      btn && btn.focus({ preventScroll: true });
    });
  }

  // function handleKeydown(e: KeyboardEvent) {
  //   if (e.key === 'Escape') {
  //     close();
  //   }
  // }
</script>

<!-- <svelte:window on:keydown={handleKeydown} /> -->
{#if isOpen}
  <div class="overlay" transition:fade={{ delay: 0, duration: 300 }} on:click={close} />
  <div class="cnt" transition:fly={{ delay: 0, duration: 300, y: 100, opacity: 0 }}>
    <div class="action" use:focus0>
      <Button kind="icon" title="Close" on:click={close}>
        <VisuallyHidden>Close</VisuallyHidden><CloseIcon size={14} />
      </Button>
    </div>
    <slot />
  </div>
{/if}

<style lang="scss">
  .overlay {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.5);
  }
  .cnt {
    position: fixed;
    max-width: min(90vw, 800px);
    width: 700px;
    top: 10%;
    left: 50%;
    transform: translate(-50%);
    background-color: var(--bg-card);
    padding: 16px;
    border-radius: 10px;
  }
  .action {
    position: absolute;
    right: 0;
    top: 0;
    padding: 5px;
  }
</style>
