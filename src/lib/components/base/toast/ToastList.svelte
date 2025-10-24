<script lang="ts">
  import { XIcon as CloseIcon } from '@lucide/svelte';
  import { fly } from 'svelte/transition';
  import { SvelteMap } from 'svelte/reactivity';

  import Spinner from '$lib/components/feedback/Spinner.svelte';

  import { removeToast, toasts } from './store';
  import type { ToastItem } from './type';

  type ToastId = string;

  const timeoutMap = new SvelteMap<ToastId, ReturnType<typeof setTimeout>>();
  const timeoutDurationMap = new SvelteMap<ToastId, number | undefined>();

  function clearTimeoutOfToast(toastId: ToastId) {
    const tid = timeoutMap.get(toastId);
    if (tid) {
      clearTimeout(tid);
      timeoutMap.delete(toastId);
    }
  }

  function setTimeoutOfToast(toastId: ToastId, duration: number) {
    if (typeof duration === 'number' && duration !== 0) {
      clearTimeoutOfToast(toastId);
      const tid = setTimeout(() => {
        removeToast(toastId);
      }, duration);
      timeoutMap.set(toastId, tid);
    }
    timeoutDurationMap.set(toastId, duration);
  }

  function findToastById(id: string | number) {
    for (const item of $toasts) {
      if (item.id === id) return item;
    }
  }

  $effect(() => {
    for (const item of $toasts) {
      const dur = timeoutDurationMap.get(item.id);
      // if duration changed -> reset timeout
      if (dur !== item.duration) {
        clearTimeoutOfToast(item.id);
        setTimeoutOfToast(item.id, item.duration);
      }
    }
  });

  function closeToast(item: ToastItem) {
    removeToast(item.id);
  }

  function armTimeout(_node: HTMLDivElement, item: ToastItem) {
    setTimeoutOfToast(item.id, item.duration);
    return {
      destroy() {
        clearTimeoutOfToast(item.id);
        timeoutDurationMap.delete(item.id);
      },
    };
  }

  function handleMouseEnter(e: MouseEvent) {
    const element = e.currentTarget as HTMLDivElement;
    const id = element.getAttribute('data-id');
    if (id) {
      clearTimeoutOfToast(id);
    }
  }

  function handleMouseLeave(e: MouseEvent) {
    const element = e.currentTarget as HTMLDivElement;
    const id = element.getAttribute('data-id');
    if (id) {
      const item = findToastById(id);
      if (item) setTimeoutOfToast(id, item.duration);
    }
  }
</script>

<!-- style="background-color: {bg[item.status]}" -->
<div class="list">
  {#each $toasts as item (item.id)}
    <div
      class="toast {item.status}"
      transition:fly={{ y: 40 }}
      data-id={item.id}
      role="list"
      use:armTimeout={item}
      onmouseenter={handleMouseEnter}
      onmouseleave={handleMouseLeave}
    >
      {#if item.icon && item.icon === 'loading'}
        <Spinner size={18} />
      {:else}
        <span></span>
      {/if}
      <p>{item.description}</p>
      {#if item.action}
        <button onclick={item.action.fn}>{item.action.label}</button>
      {/if}
      <button title="Close" class="close" onclick={() => closeToast(item)}>
        <span class="vh">Close</span><CloseIcon size={14} />
      </button>
    </div>
  {/each}
</div>

<style lang="scss">
  .list {
    margin: 0;
    padding: 0;
    list-style: none;
    position: fixed;
    bottom: env(safe-area-inset-bottom, 15px);
    left: 15px;
    z-index: 100;
  }
  button {
    appearance: none;
    outline: none;
    user-select: none;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 100px;
    padding: 6px 8px;
    font-weight: 800;
    color: inherit;
    background-color: var(--bg);
    &:active {
      transform: scale(0.97);
    }
    &:hover {
      background-color: var(--bg-hover);
      border-color: var(--bo-hover);
    }
    @media (prefers-color-scheme: dark) {
      --bg: hsl(0deg 0% 100% / 7%);
      --bg-hover: hsl(0deg 0% 100% / 17%);
      --bo-hover: hsl(0deg 0% 100% / 27%);
    }
    @media (prefers-color-scheme: light) {
      --bg: hsl(0deg 0% 0% / 5%);
      --bg-hover: hsl(0deg 0% 0% / 15%);
      --bo-hover: hsl(0deg 0% 0% / 25%);
    }
  }

  .toast {
    padding: 10px 10px;
    border-radius: 8px;
    margin: 14px 0;
    max-width: 90vw;
    min-width: min(85vw, 400px);
    color: var(--text);
    border: 1px solid var(--border);
    background-color: var(--bg);
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
    display: grid;
    grid-template-columns: auto 1fr auto auto;
    gap: 3px;
    align-items: center;

    p {
      margin: 5px 0;
    }

    .close {
      padding: 6px;
      margin-left: 10px;
      background-color: transparent;
    }
  }
  // steal from https://github.com/emilkowalski/sonner/blob/main/src/styles.css
  @media (prefers-color-scheme: light) {
    .toast {
      &.normal {
        --bg: #fff;
        --border: hsl(0, 0%, 93%);
        --text: hsl(0, 0%, 9%);
      }
      &.info {
        --bg: hsl(208, 100%, 97%);
        --border: hsl(221, 91%, 91%);
        --text: hsl(210, 92%, 45%);
      }
      &.success {
        --bg: hsl(143, 85%, 96%);
        --border: hsl(145, 92%, 91%);
        --text: hsl(140, 100%, 27%);
      }
      &.error {
        --bg: hsl(359, 100%, 97%);
        --border: hsl(359, 100%, 94%);
        --text: hsl(360, 100%, 45%);
      }
      &.warning {
        --bg: hsl(49, 100%, 97%);
        --border: hsl(49, 91%, 91%);
        --text: hsl(31, 92%, 45%);
      }
    }
  }
  @media (prefers-color-scheme: dark) {
    .toast {
      &.normal {
        --bg: #000;
        --border: hsl(0, 0%, 20%);
        --text: hsl(0, 0%, 99%);
      }
      &.info {
        --bg: hsl(215, 100%, 6%);
        --border: hsl(223, 100%, 12%);
        --text: hsl(216, 87%, 65%);
      }
      &.success {
        --bg: hsl(150, 100%, 6%);
        --border: hsl(147, 100%, 12%);
        --text: hsl(150, 86%, 65%);
      }
      &.error {
        --bg: hsl(358, 76%, 10%);
        --border: hsl(357, 89%, 16%);
        --text: hsl(358, 100%, 81%);
      }
      &.warning {
        --bg: hsl(64, 100%, 6%);
        --border: hsl(60, 100%, 12%);
        --text: hsl(46, 87%, 65%);
      }
    }
  }

  .vh {
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    height: 1px;
    overflow: hidden;
    position: absolute;
    white-space: nowrap;
    width: 1px;
  }
</style>
