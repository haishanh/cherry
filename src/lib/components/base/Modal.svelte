<script lang="ts">
  import { fly } from 'svelte/transition';
  /* import { quintOut } from "svelte/easing"; */
  import { fade } from 'svelte/transition';

  let isOpen = false;

  export function open() {
    isOpen = true;
  }
  function close() {
    isOpen = false;
  }

  // setTimeout(() => {
  //   open();
  // }, 2000);

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      close();
    }
    console.log(e);
  }
</script>

<svelte:window on:keydown={handleKeydown} />
{#if isOpen}
  <div class="overlay" transition:fade={{ delay: 0, duration: 300 }}>
    <div class="cnt" transition:fly={{ delay: 0, duration: 300, y: 100, opacity: 0 }}>
      <slot />
    </div>
  </div>
{/if}

<style lang="scss">
  .overlay {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.5);
  }
  .cnt {
    position: absolute;
    top: 30%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: var(--bg-card);
    padding: 16px;
    border-radius: 10px;
  }
</style>
