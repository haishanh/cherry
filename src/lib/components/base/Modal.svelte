<script lang="ts" module>
  export enum EVENT_TYPE {
    Close,
  }
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import { fly, fade } from 'svelte/transition';

  import Button from '$lib/components/base/Button.svelte';
  import VisuallyHidden from '$lib/components/base/VisuallyHidden.svelte';
  import { decModalZi, incModalZi } from '$lib/utils/common.util';

  import Portal from './misc/Portal.svelte';
  import { XIcon } from '@lucide/svelte';

  const noop = () => {};

  type Props = {
    ev0?: (x: { type: EVENT_TYPE }) => void;
    closeButtonPosition?: 'left' | 'right';
    verticalAlign?: 'start' | 'center';
    children: Snippet;
    footer?: Snippet;
  };

  let { ev0 = noop, closeButtonPosition = 'right', verticalAlign = 'center', children, footer }: Props = $props();

  let isOpen = $state(false);

  export function getState() {
    return { isOpen };
  }

  let zi = $state(1);
  export function open() {
    zi = incModalZi();
    isOpen = true;
  }
  export function close() {
    decModalZi();
    isOpen = false;
    ev0({ type: EVENT_TYPE.Close });
    // dispatch('ev0', { type: EVENT_TYPE.Close });
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

    function handleWindowOnClick(e: MouseEvent) {
      if (!(e.target instanceof HTMLElement)) return;
      if (!('cherryModalDismiss' in e.target.dataset)) return;
      if (!node.contains(e.target)) {
        close();
      }
    }

    leadingFocusGuard.focus();
    window.addEventListener('keydown', handleWindowOnKeydown);
    window.addEventListener('click', handleWindowOnClick);
    return {
      destroy: () => {
        if (tailingFocusGuard) tailingFocusGuard.removeEventListener('focus', onFocusTailingGuard);
        window.removeEventListener('keydown', handleWindowOnKeydown);
        window.removeEventListener('click', handleWindowOnClick);
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
      <div class="inset0" data-cherry-modal-dismiss></div>
      <div class="cnt" use:focus0 transition:fly={{ delay: 0, duration: 300, y: 100 }}>
        <div class="focus-guard" data-leading-focus-guard tabindex="-1"></div>
        <div class="action" class:left={closeButtonPosition === 'left'} class:right={closeButtonPosition === 'right'}>
          <Button modifier={['minimal', 'p5']} title="Close" onclick={close}>
            <VisuallyHidden>Close</VisuallyHidden><XIcon size={20} />
          </Button>
        </div>
        <div class="slot-wrap">{@render children?.()}</div>
        {#if footer}
          <div class="footer">{@render footer()}</div>
        {/if}
        <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
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
    @media (prefers-color-scheme: dark) {
      --bg: hsl(0deg 0% 0% / 52%);
    }
    @media (prefers-color-scheme: light) {
      --bg: hsl(240deg 12% 92% / 90%);
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
    pointer-events: none;
  }
</style>
