<script lang="ts">
  import VisuallyHidden from '$lib/components/base/VisuallyHidden.svelte';
  import { CircleCheckBig, CopyIcon } from '@lucide/svelte';

  let state = $state('none');
  type Props = {
    provide: () => Promise<string> | string;
  };
  let { provide }: Props = $props();

  async function copy() {
    const str = await provide();
    await navigator.clipboard.writeText(str);

    state = 'copied';
    setTimeout(() => {
      state = 'none';
    }, 1000);
  }
</script>

<button class="btn" onclick={copy}>
  <VisuallyHidden>Copy</VisuallyHidden>
  {#if state === 'copied'}
    <span class="ico">
      <CircleCheckBig size={18} />
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
