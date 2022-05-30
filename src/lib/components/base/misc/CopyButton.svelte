<script lang="ts">
  import CheckCircle from '@hsjs/svelte-icons/feather/CheckCircle.svelte';
  import Copy from '@hsjs/svelte-icons/feather/Copy.svelte';

  import VisuallyHidden from '$lib/components/base/VisuallyHidden.svelte';

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
      <CheckCircle size={18} />
    </span>
  {:else}
    <span class="ico">
      <Copy size={18} />
    </span>
  {/if}
</button>

<style lang="scss">
  .btn {
    -webkit-appearance: none;
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
