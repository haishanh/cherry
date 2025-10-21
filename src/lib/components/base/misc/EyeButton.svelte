<script lang="ts">
  import VisuallyHidden from '$lib/components/base/VisuallyHidden.svelte';
  import { EyeIcon, EyeOffIcon } from '@lucide/svelte';

  let { show = $bindable(false), onclick } = $props();
</script>

<button class="btn" {onclick}>
  <VisuallyHidden>Copy</VisuallyHidden>
  <span class="ico">
    {#if !show}
      <EyeIcon size={18} />
    {:else}
      <EyeOffIcon size={18} />
    {/if}
  </span>
</button>

<style lang="scss">
  .btn {
    -webkit-appearance: none;
    appearance: none;
    color: var(--fg);
    outline: none;
    cursor: pointer;
    background-color: var(--bg-btn);
    border: 1px solid var(--color-btn-bo);
    padding: 3px;
    border-radius: 5px;
    position: relative;
    width: 28px;
    height: 28px;
    &:focus {
      border-color: var(--focus-blue);
    }
    &:hover {
      background: var(--color-btn-hover);
    }
  }
  .ico {
    display: inline-flex;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
</style>
