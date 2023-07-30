<script lang="ts">
  import Popover from '$lib/components/base/popover/Popover.svelte';

  export let isOpen = false;
  let openTimeoutId: ReturnType<typeof setTimeout>;
  let closeTimeoutId: ReturnType<typeof setTimeout>;

  function open() {
    if (!isOpen) isOpen = true;
  }
  function close() {
    if (isOpen) isOpen = false;
  }

  function deferClose(delay = 750) {
    openTimeoutId && clearTimeout(openTimeoutId);
    if (!isOpen) return;
    closeTimeoutId && clearTimeout(closeTimeoutId);
    closeTimeoutId = setTimeout(close, delay);
  }
  function deferOpen(delay = 700) {
    closeTimeoutId && clearTimeout(closeTimeoutId);
    if (isOpen) return;
    openTimeoutId && clearTimeout(openTimeoutId);
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

  let anchor: HTMLElement;
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<span bind:this={anchor} on:mouseenter={handleItemOnMouseEnter} on:mouseleave={handleItemOnMouseLeave}>
  <slot name="trigger" />
</span>

<Popover
  bind:isOpen
  {anchor}
  vOffset={5}
  close={closePopup}
  on:mouseenter0={handlePopoverOnMouseEnter}
  on:mouseleave0={handlePopoverOnMouseLeave}
>
  <slot name="content" />
</Popover>

<style lang="scss">
  span {
    display: inline-flex;
  }
</style>
