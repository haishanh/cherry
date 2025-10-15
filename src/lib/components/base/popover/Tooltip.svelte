<script lang="ts">
  import Popover from '$lib/components/base/popover/Popover.svelte';
  import type { Snippet } from 'svelte';

  type Props = {
    content: Snippet;
    trigger: Snippet;
    isOpen?: boolean;
  };

  let { content, trigger, isOpen = false }: Props = $props();

  let openTimeoutId: ReturnType<typeof setTimeout>;
  let closeTimeoutId: ReturnType<typeof setTimeout>;

  function open() {
    if (!isOpen) isOpen = true;
  }
  function close() {
    if (isOpen) isOpen = false;
  }

  function deferClose(delay = 750) {
    if (openTimeoutId) clearTimeout(openTimeoutId);
    if (!isOpen) return;
    if (closeTimeoutId) clearTimeout(closeTimeoutId);
    closeTimeoutId = setTimeout(close, delay);
  }
  function deferOpen(delay = 700) {
    if (closeTimeoutId) clearTimeout(closeTimeoutId);
    if (isOpen) return;
    if (openTimeoutId) clearTimeout(openTimeoutId);
    openTimeoutId = setTimeout(open, delay);
  }

  function handlePopoverOnMouseEnter() {
    deferOpen(700);
  }
  function handlePopoverOnMouseLeave() {
    deferClose(750);
  }
  function closePopup() {
    isOpen = false;
  }
  function handleItemOnMouseEnter() {
    deferOpen(200);
  }
  function handleItemOnMouseLeave() {
    deferClose(250);
  }

  let anchor: HTMLElement | null = $state(null);
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<span bind:this={anchor} onmouseenter={handleItemOnMouseEnter} onmouseleave={handleItemOnMouseLeave}>
  {@render trigger()}
</span>

<Popover
  bind:isOpen
  {anchor}
  vOffset={5}
  close={closePopup}
  mouseenter0={handlePopoverOnMouseEnter}
  mouseleave0={handlePopoverOnMouseLeave}
>
  {@render content()}
</Popover>

<style lang="scss">
  span {
    display: inline-flex;
  }
</style>
