<script lang="ts">
  import CherryLeaf from '$lib/components/base/CherryLeaf.svelte';
  let { size = 50 }: { size?: number } = $props();
</script>

<span class="leaf"><CherryLeaf {size} /></span>

<style lang="scss">
  .leaf {
    display: inline-flex;
    position: relative;
    animation: 3s linear 0s infinite running spin;
  }
  @keyframes spin {
    0% {
      transform: scale(0.7) rotateZ(0deg);
    }
    25% {
      transform: scale(0.95) rotateZ(90deg);
    }
    50% {
      transform: scale(0.7) rotateZ(180deg);
    }
    75% {
      transform: scale(1.05) rotateZ(270deg);
    }
    100% {
      transform: scale(0.7) rotateZ(360deg);
    }
  }
</style>
