<script lang="ts">
  export let isOpen = false;
  export let anchor: HTMLElement;
  export let close: () => void;
  // vertical offset - how far the popover will be placed with the anchor
  export let vOffset = 2;

  const EVENT = {
    mouseenter0: 'mouseenter0',
    mouseleave0: 'mouseleave0',
    position: 'position',
  };

  import { createEventDispatcher } from 'svelte';

  import { popover, type PopoverPlacement } from '$lib/components/actions/popover.action';

  import Portal from '../misc/Portal.svelte';
  const dispatch = createEventDispatcher();

  let style = 'top:0;left:0;';

  function handlePopoverPositionChange(opts: { position: { top: number; left: number }; placement: PopoverPlacement }) {
    const { top, left } = opts.position;
    style = `top:${top}px;left:${left}px`;
    dispatch(EVENT.position, opts);
  }
</script>

{#if isOpen}
  <Portal>
    <div
      class="popover"
      use:popover={{ anchor, vOffset, closeFn: close, onPosition: handlePopoverPositionChange }}
      {style}
      role="tooltip"
      on:mouseenter={() => dispatch(EVENT.mouseenter0)}
      on:mouseleave={() => dispatch(EVENT.mouseleave0)}
    >
      <slot />
    </div>
  </Portal>
{/if}

<style lang="scss">
  .popover {
    position: absolute;
    background-color: var(--bg-card);
    max-width: min(90vw, 350px);
    // prettier-ignore
    box-shadow: 0 1px 1px rgba(0,0,0,0.15),
                0 2px 2px rgba(0,0,0,0.15),
                0 4px 4px rgba(0,0,0,0.15),
                0 8px 8px rgba(0,0,0,0.15);
    border-radius: 10px;
    padding: 8px;
    overflow: hidden;
    border: 1px solid transparent;
    border-color: hsl(0deg 0% var(--lightness));
    @media (prefers-color-scheme: dark) {
      --lightness: 30%;
    }
    @media (prefers-color-scheme: light) {
      --lightness: 50%;
    }
  }
</style>
