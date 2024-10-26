<script lang="ts" context="module">
  export enum EVENT_TYPE {
    Close,
  }
</script>

<script lang="ts">
  import CloseIcon from '@hsjs/svelte-icons/feather/X.svelte';
  import { createEventDispatcher } from 'svelte';
  import { fly } from 'svelte/transition';
  import { fade } from 'svelte/transition';

  import Button from '$lib/components/base/Button.svelte';
  import VisuallyHidden from '$lib/components/base/VisuallyHidden.svelte';
  import { decModalZi, incModalZi } from '$lib/utils/common.util';

  import Portal from './misc/Portal.svelte';

  export let closeButtonPosition: 'left' | 'right' = 'right';
  export let verticalAlign: 'start' | 'center' | 'end' = 'center';
  const dispatch = createEventDispatcher();

  let isOpen = false;

  export function state() {
    return { isOpen };
  }

  let zi = 1;
  export function open() {
    zi = incModalZi();
    isOpen = true;
  }
  export function close() {
    decModalZi();
    isOpen = false;
    dispatch('ev0', { type: EVENT_TYPE.Close });
  }

  function handleClickOverlay(__event: MouseEvent) {
    close();
  }

  function naivePreventScroll() {
    const scrollBarTrackWidth = window.innerWidth - document.body.clientWidth;
    const pr = parseInt(getComputedStyle(document.body).paddingRight.replace('px', ''), 10);
    const shouldDisable = scrollBarTrackWidth > 0 && !isNaN(pr);
    if (shouldDisable) {
      document.body.style.overflow = 'hidden';
      const previousPr = document.body.style.paddingRight;
      document.body.style.paddingRight = `${scrollBarTrackWidth + pr}px`;
      return () => {
        document.body.style.overflow = 'unset';
        document.body.style.paddingRight = previousPr;
      };
    }
    return () => {};
  }

  function focus0(node: HTMLDivElement) {
    let leadingFocusGuard = node.querySelector('[data-leading-focus-guard]') as HTMLElement;
    let tailingFocusGuard = node.querySelector('[data-tailing-focus-guard]') as HTMLElement;
    const first = node.querySelector('button') as HTMLButtonElement;

    const restoreScroll = naivePreventScroll();

    function onFocusTailingGuard() {
      first.focus();
    }

    if (tailingFocusGuard) {
      tailingFocusGuard.addEventListener('focus', onFocusTailingGuard);
    }

    function handleWindowOnKeydown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        const active = document.activeElement as HTMLElement;
        if (active) {
          if (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA') {
            active.blur();
          } else {
            close();
          }
        }
        if (active === document.body || !active) {
          close();
        }
      }
    }

    leadingFocusGuard.focus();
    window.addEventListener('keydown', handleWindowOnKeydown);
    return {
      destroy: () => {
        if (tailingFocusGuard) tailingFocusGuard.removeEventListener('focus', onFocusTailingGuard);
        window.removeEventListener('keydown', handleWindowOnKeydown);
        restoreScroll();
      },
    };
  }
</script>

<Portal>
  {#if isOpen}
    <div
      data-cherry-modal-overlay
      style="z-index:{zi}"
      class="overlay {verticalAlign}"
      transition:fade={{ delay: 0, duration: 300 }}
    >
      <!-- svelte-ignore a11y-no-static-element-interactions a11y-click-events-have-key-events -->
      <div class="inset0" on:click={handleClickOverlay}></div>
      <div class="cnt" use:focus0 transition:fly={{ delay: 0, duration: 300, y: 100 }}>
        <div class="focus-guard" data-leading-focus-guard tabindex="-1"></div>
        <div class="action" class:left={closeButtonPosition === 'left'} class:right={closeButtonPosition === 'right'}>
          <Button modifier={['minimal', 'p5']} title="Close" onclick={close}>
            <VisuallyHidden>Close</VisuallyHidden><CloseIcon size={20} />
          </Button>
        </div>
        <div class="slot-wrap"><slot /></div>
        {#if $$slots.footer}
          <div class="footer"><slot name="footer" /></div>
        {/if}
        <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
        <div class="focus-guard" data-tailing-focus-guard tabindex="0"></div>
      </div>
    </div>
  {/if}
</Portal>

<style lang="scss">
  .inset0 {
    position: fixed;
    inset: 0;
  }
  .overlay {
    @media (prefers-color-scheme: dark) {
      --bg: hsl(0deg 0% 0% / 52%);
    }
    @media (prefers-color-scheme: light) {
      --bg: hsl(240deg 12% 92% / 90%);
    }
    position: fixed;
    inset: 0;
    background-color: var(--bg);
    padding-top: 60px;
    padding-bottom: 60px;
    display: flex;
    flex-direction: column;
    &.center {
      justify-content: center;
    }
    &.start {
      justify-content: flex-start;
    }
    &.end {
      justify-content: flex-end;
    }
  }
  .slot-wrap {
    height: 100%;
    padding: 16px;
    overflow: auto;
    flex: 1 1 0%;
  }
  .cnt {
    flex: 0;
    position: relative;
    max-width: min(90vw, 800px);
    width: 700px;
    margin: 0 auto;
    max-height: 100%;
    display: flex;
    flex-direction: column;
    background-color: var(--bg-card);
    border: 1px solid var(--bo);
    border-radius: 10px;
    @media (prefers-color-scheme: dark) {
      --bo: hsl(0deg 0% 29%);
    }
    @media (prefers-color-scheme: light) {
      --bo: transparent;
    }
  }
  .action {
    position: absolute;
    top: 0;
    padding: 5px;
    &.left {
      left: 0;
    }
    &.right {
      right: 0;
    }
  }
  .focus-guard {
    width: 1px;
    height: 0px;
    padding: 0;
    overflow: hidden;
    position: fixed;
    top: 1px;
    left: 1px;
  }
</style>
