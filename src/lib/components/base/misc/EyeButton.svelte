<script lang="ts">

  import VisuallyHidden from '$lib/components/base/VisuallyHidden.svelte';
    import { EyeIcon, EyeOffIcon } from 'lucide-svelte';

  export let show = false;
</script>

<button class="btn" on:click>
  <VisuallyHidden>Copy</VisuallyHidden>
  {#if !show}
    <span class="ico">
      <EyeIcon size={18} />
    </span>
  {:else}
    <span class="ico">
      <EyeOffIcon size={18} />
    </span>
  {/if}
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
