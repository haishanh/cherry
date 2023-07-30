<script lang="ts">
  import type { ToastItem } from './type';

  export let toast: ToastItem;

  function handleMouseEnter() {
    //
  }
  function handleMouseLeave() {
    //
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="toast" on:mouseenter={handleMouseEnter} on:mouseleave={handleMouseLeave}>
  <p>{toast.description}</p>
</div>

<style lang="scss">
  .toast {
    background-color: pink;
  }
</style>
