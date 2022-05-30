<script lang="ts">
  import { onDestroy, onMount } from 'svelte';

  const browser = typeof window !== 'undefined' && typeof window.document !== 'undefined';

  let ref: HTMLDivElement;
  let portal: HTMLDivElement;
  onMount(() => {
    if (!browser) return;
    portal = document.createElement('div');
    portal.setAttribute('data-cherry-portal', '');
    document.body.appendChild(portal);
    portal.appendChild(ref);
  });

  onDestroy(() => {
    if (!browser) return;
    document.body.removeChild(portal);
  });
</script>

<div class="portal-clone">
  <div bind:this={ref}>
    <slot />
  </div>
</div>

<style lang="scss">
  .portal-clone {
    display: none;
  }
</style>
