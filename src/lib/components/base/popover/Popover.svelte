<script lang="ts">
  import { popover, type PopoverPlacement } from '$lib/components/actions/popover.action';
  import type { Snippet } from 'svelte';

  import Portal from '../misc/Portal.svelte';

  type PositionChangeOpts = {
    position: { top: number; left: number };
    placement: PopoverPlacement;
  };

  type Props = {
    mouseenter0: () => void;
    mouseleave0: () => void;
    position?: (x: PositionChangeOpts) => void;
    isOpen?: boolean;
    anchor: HTMLElement;
    close: () => void;
    // vertical offset - how far the popover will be placed with the anchor
    vOffset?: number;
    children: Snippet;
  };

  let {
    mouseenter0,
    mouseleave0,
    position,
    isOpen = $bindable(false),
    anchor,
    close,
    vOffset = 2,
    children,
  }: Props = $props();

  let style = $state('top:0;left:0;');

  function handlePopoverPositionChange(opts: PositionChangeOpts) {
    const { top, left } = opts.position;
    style = `top:${top}px;left:${left}px`;
    position?.(opts);
  }
</script>

{#if isOpen}
  <Portal>
    <div
      class="popover"
      use:popover={{ anchor, vOffset, closeFn: close, onPosition: handlePopoverPositionChange }}
      {style}
      role="tooltip"
      onmouseenter={() => mouseenter0()}
      onmouseleave={() => mouseleave0()}
    >
      {@render children?.()}
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
