<script lang="ts">
  import { onDestroy, onMount, type Snippet } from 'svelte';

  const browser = typeof window !== 'undefined' && typeof window.document !== 'undefined';

  type Props = {
    children: Snippet;
  };

  let { children }: Props = $props();

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
    {@render children()}
  </div>
</div>

<style lang="scss">
  .portal-clone {
    display: none;
  }
</style>
