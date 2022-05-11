<script lang="ts">
  import CloseIcon from '@hsjs/svelte-icons/feather/X.svelte';
  import { flip } from 'svelte/animate';
  import { fly } from 'svelte/transition';

  import { removeToast, toasts } from './store';
  import type { ToastItem } from './type';

  // steal from chakara ui
  const bg = { info: '#3181ce', success: '#38a169', error: '#e43e3e', warning: '#dd6a1f' };

  const timeoutMap = new WeakMap<ToastItem, ReturnType<typeof setTimeout>>();

  function findToastById(id: string | number) {
    for (const item of $toasts) {
      if ('' + item.id === '' + id) return item;
    }
  }

  function armTimeout(_node: HTMLDivElement, item: ToastItem) {
    if (item.duration) {
      const tid = setTimeout(() => {
        removeToast(item.id);
      }, item.duration);
      timeoutMap.set(item, tid);
    }
    return {
      destroy() {
        const tid = timeoutMap.get(item);
        if (tid) clearTimeout(tid);
      },
    };
  }

  function handleMouseEnter(e: MouseEvent) {
    const element = e.currentTarget as HTMLDivElement;
    const id = element.getAttribute('data-id');
    if (id) {
      const item = findToastById(id);
      const tid = timeoutMap.get(item);
      console.log('reset timer for ', item, id);
      if (tid) clearTimeout(tid);
    }
  }

  function handleMouseLeave(e: MouseEvent) {
    const element = e.currentTarget as HTMLDivElement;
    const id = element.getAttribute('data-id');
    if (id) {
      const item = findToastById(id);
      if (item && item.duration) {
        const tid = setTimeout(() => {
          removeToast(item.id);
        }, item.duration);
        timeoutMap.set(item, tid);
      }
    }
  }
</script>

<div class="list">
  {#each $toasts as item (item.id)}
    <div
      class="toast"
      animate:flip
      transition:fly={{ y: 40 }}
      style="background-color: {bg[item.status]}"
      data-id={item.id}
      use:armTimeout={item}
      on:mouseenter={handleMouseEnter}
      on:mouseleave={handleMouseLeave}
    >
      <p>{item.description}</p>
      {#if item.action}
        <button on:click={item.action.fn}>{item.action.label}</button>
      {/if}
      <button title="Close" class="close">
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
    bottom: env(safe-area-inset-bottom, 0px);
    left: 50%;
    transform: translateX(-50%);
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
    color: #ddd;
    background-color: hsl(0deg 0% 0% / 6%);
    &:active {
      transform: scale(0.97);
    }
    &:hover {
      background-color: hsl(0deg 0% 0% / 12%);
      border-color: hsl(0deg 0% 0% / 13%);
    }
  }
  .toast {
    padding: 10px 10px;
    border-radius: 8px;
    margin: 14px 0;
    max-width: 90vw;
    min-width: min(50vw, 400px);
    color: #ddd;

    display: grid;
    grid-template-columns: 1fr auto auto;
    gap: 3px;
    align-items: center;

    p {
      margin: 5px 0;
    }

    .close {
      padding: 6px;
      margin-left: 10px;
      background-color: transparent;
      &:hover {
        background-color: hsl(0deg 0% 0% / 0.1);
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
