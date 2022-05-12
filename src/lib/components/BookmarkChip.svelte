<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  import type { BookmarkFromDb } from '$lib/type';
  import * as httpUtil from '$lib/utils/http.util';

  import { add as toast } from './base/toast/store';
  import PopoverAction from './bookmark-chip/PopoverAction.svelte';

  export let bookmark: BookmarkFromDb;

  const dispatch = createEventDispatcher();

  let style = 'top:0;left:0;';
  let trigger: HTMLElement;
  // vertical offset - how far the popover will be placed with the trigger
  let vOffset = 2;

  let openTimeoutId: ReturnType<typeof setTimeout>;
  let closeTimeoutId: ReturnType<typeof setTimeout>;
  let isOpen = false;
  let popoverPlace = 'north';

  function handleItemOnMouseEnter() {
    closeTimeoutId && clearTimeout(closeTimeoutId);
    if (isOpen) return;
    openTimeoutId && clearTimeout(openTimeoutId);

    openTimeoutId = setTimeout(() => {
      if (!isOpen) isOpen = true;
    }, 700);
  }

  function handleItemOnMouseLeave() {
    console.log('on leave');
    openTimeoutId && clearTimeout(openTimeoutId);
    if (!isOpen) return;

    closeTimeoutId && clearTimeout(closeTimeoutId);
    closeTimeoutId = setTimeout(() => {
      if (isOpen) isOpen = false;
    }, 1000);
  }

  // function openPopup() {
  //   isOpen = true;
  // }

  function closePopup() {
    isOpen = false;
  }

  function positionPopover(node: HTMLDivElement) {
    // popover rect
    const p = node.getBoundingClientRect();
    // trigger rect
    const t = trigger.getBoundingClientRect();

    let top = 0;
    let left = 0;

    if (t.bottom + vOffset + p.height <= window.innerHeight) {
      // try place below the trigger
      top = t.top + t.height + vOffset + window.pageYOffset;
      popoverPlace = 'south';
    } else {
      top = t.top - vOffset - p.height + window.pageYOffset;
      popoverPlace = 'north';
    }

    const tmid = Math.floor((t.right - t.left) / 2) + t.left;
    // try to center align it if possible
    if (tmid + Math.ceil(p.width / 2) <= window.innerWidth && tmid <= t.left) {
      left = tmid - Math.ceil(p.width / 2) + window.pageXOffset;
      console.log(1);
    } else if (t.left >= 0 && t.left + p.width <= window.innerWidth) {
      // try align left edge with the trigger
      left = t.left + window.pageXOffset;
      console.log(2);
    } else if (t.right >= p.width) {
      // aight with right edge of the trigger
      left = t.right - p.width + window.pageXOffset;
      console.log(3);
    } else {
      // center to the *window*
      left = Math.floor((window.innerWidth - p.width) / 2) + window.pageXOffset;
      console.log(4);
    }
    style = `top:${top}px;left:${left}px`;
  }

  function poped(node: HTMLDivElement) {
    console.log('popover mount');
    requestAnimationFrame(() => {
      positionPopover(node);
    });

    function listener(event: MouseEvent | TouchEvent) {
      // in this case it's not a click "outside"
      if (node.contains(event.target as HTMLElement)) return;
      // let the trigger handle mouse event by itself
      if (trigger.contains(event.target as HTMLElement)) return;

      closePopup();
      // menuButton.focus();
    }

    node.ownerDocument.addEventListener('mousedown', listener);
    //node.ownerDocument.addEventListener("keydown", onKeydown);
    return {
      destroy() {
        console.log('popover xxx');
        node.ownerDocument.removeEventListener('mousedown', listener);
        // node.ownerDocument.removeEventListener("keydown", onKeydown);
      },
    };
  }

  async function delBookmark(id: string | number) {
    const ret = await httpUtil.request({ method: 'DELETE', url: `/api/bookmarks/${id}` });
    console.log(ret.data);
  }

  async function restoreBookmark(id: string | number) {
    console.log('restore', id);
    const ret = await httpUtil.request({ method: 'POST', url: `/api/bookmarks/${id}`, data: { op: 'restore' } });
    console.log(ret.data);
  }

  async function handleDelete() {
    if (!bookmark) return;
    console.log('deleted', bookmark.id);
    // delete
    await delBookmark(bookmark.id);

    let bookmarkId = bookmark.id;
    dispatch('remove', bookmark);

    const restore = async () => {
      await restoreBookmark(bookmarkId);
      console.log('dispatch resotre', bookmarkId);
      dispatch('restore', bookmarkId);
    };

    toast({
      description: 'Bookmark deleted.',
      action: {
        label: 'UNDO',
        fn: () => {
          restore()
            .then(() => {
              // TODO dispatch restore event
            })
            .catch((e) => {
              console.log(e);
            });
        },
      },
    });
  }
</script>

<div>
  <a
    class:isOpen
    href={bookmark.url}
    target="_blank"
    rel="noopener noreferrer"
    bind:this={trigger}
    on:mouseenter={handleItemOnMouseEnter}
    on:mouseleave={handleItemOnMouseLeave}
  >
    <img
      loading="lazy"
      src={`https://icons.duckduckgo.com/ip3/${new URL(bookmark.url).hostname}.ico`}
      alt={'favicon of the site'}
    />
    {bookmark.title}
  </a>

  {#if isOpen}
    <div
      class="popover"
      use:poped
      {style}
      on:mouseenter={handleItemOnMouseEnter}
      on:mouseleave={handleItemOnMouseLeave}
    >
      {#if popoverPlace === 'south'}
        <PopoverAction on:close={closePopup} on:delete={handleDelete} />
      {/if}
      <div>
        <h4>Link</h4>
        <p class="clamp clamp-2">{bookmark.url}</p>
        <h4>Description</h4>
        <p class="clamp">{bookmark.desc}</p>
      </div>
      {#if popoverPlace === 'north'}
        <PopoverAction on:close={closePopup} on:delete={handleDelete} />
      {/if}
    </div>
  {/if}
</div>

<style lang="scss">
  a {
    text-decoration: none;
    color: inherit;
    display: flex;
    align-items: center;
    gap: 10px;
    background-color: var(--bg-card);
    padding: 10px;
    border-radius: 300px;
    border: 1px solid transparent;
    &.isOpen {
      @media (prefers-color-scheme: dark) {
        --lightness: 30%;
      }
      @media (prefers-color-scheme: light) {
        --lightness: 50%;
      }
      border-color: hsl(0deg 0% var(--lightness));
    }
  }
  img {
    width: 20px;
    height: 20px;
  }

  .popover {
    position: absolute;
    // background-color: pink;
    background-color: var(--bg-card);
    max-width: min(90vw, 350px);
    // prettier-ignore
    box-shadow: 0 1px 1px rgba(0,0,0,0.15),
                0 2px 2px rgba(0,0,0,0.15),
                0 4px 4px rgba(0,0,0,0.15),
                0 8px 8px rgba(0,0,0,0.15);
    border-radius: 10px;
    padding: 8px;
    overflow: hidden;
    border: 1px solid transparent;
    @media (prefers-color-scheme: dark) {
      --lightness: 30%;
    }
    @media (prefers-color-scheme: light) {
      --lightness: 50%;
    }
    border-color: hsl(0deg 0% var(--lightness));
    p {
      margin-block: 5px;
    }
    h4 {
      margin-block: 5px;
    }
    p:nth-child(1) {
      font-size: 0.9em;
    }
  }

  .clamp {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    overflow: hidden;
  }
  .clamp-2 {
    -webkit-line-clamp: 2;
  }
</style>
