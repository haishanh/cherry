<script lang="ts">
  import VisuallyHidden from '$lib/components/base/VisuallyHidden.svelte';
  import { CheckCircleIcon, CopyIcon } from 'lucide-svelte';

  let state = 'none';
  export let provide: () => Promise<string> | string;

  async function copy() {
    const str = await provide();
    await navigator.clipboard.writeText(str);

    state = 'copied';
    setTimeout(() => {
      state = 'none';
    }, 1000);
  }
</script>

<button class="btn" on:click={copy}>
  <VisuallyHidden>Copy</VisuallyHidden>
  {#if state === 'copied'}
    <span class="ico">
      <CheckCircleIcon size={18} />
    </span>
  {:else}
    <span class="ico">
      <CopyIcon size={18} />
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
