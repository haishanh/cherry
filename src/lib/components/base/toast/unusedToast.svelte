<script lang="ts">
  import type { ToastItem } from './type';

  type Props = {
    toast: ToastItem;
  };
  let { toast }: Props = $props();

  function handleMouseEnter() {
    //
  }
  function handleMouseLeave() {
    //
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="toast" onmouseenter={handleMouseEnter} onmouseleave={handleMouseLeave}>
  <p>{toast.description}</p>
</div>

<style lang="scss">
  .toast {
    background-color: pink;
  }
</style>
