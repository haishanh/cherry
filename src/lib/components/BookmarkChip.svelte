<script lang="ts">
  import Edit from '@hsjs/svelte-icons/feather/Edit.svelte';
  import Trash from '@hsjs/svelte-icons/feather/Trash.svelte';

  import Button from '$lib/components/base/Button.svelte';
  import type { BookmarkFromDb } from '$lib/type';

  export let bookmark: BookmarkFromDb;

  let style = 'top:0;left:0;';
  let trigger: HTMLElement;
  // vertical offset - how far the popover will be placed with the trigger
  let vOffset = 2;

  let openTimeoutId: ReturnType<typeof setTimeout>;
  let closeTimeoutId: ReturnType<typeof setTimeout>;
  let isOpen = false;

  function handleItemOnMouseEnter() {
    closeTimeoutId && clearTimeout(closeTimeoutId);
    if (isOpen) return;
    openTimeoutId && clearTimeout(openTimeoutId);

    openTimeoutId = setTimeout(() => {
      if (!isOpen) isOpen = true;
    }, 700);
  }

  function handleItemOnMouseLeave() {
    openTimeoutId && clearTimeout(openTimeoutId);
    if (!isOpen) return;

    // closeTimeoutId && clearTimeout(closeTimeoutId);
    // closeTimeoutId = setTimeout(() => {
    //   if (isOpen) isOpen = false;
    // }, 1000);
  }

  // function openPopup() {
  //   isOpen = true;
  // }

  function closePopup() {
    isOpen = false;
  }

  function poped(node: HTMLDivElement) {
    // popover rect
    const p = node.getBoundingClientRect();
    // trigger rect
    const t = trigger.getBoundingClientRect();

    let top = 0;
    let left = 0;

    if (t.bottom + vOffset + p.height <= window.innerHeight) {
      // try place below the trigger
      top = t.top + t.height + vOffset + window.pageYOffset;
    } else {
      top = t.top - vOffset - p.height + window.pageYOffset;
    }

    const tmid = Math.floor((t.right - t.left) / 2) + t.left;
    // try to center align it if possible
    if (tmid + Math.ceil(p.width / 2) <= window.innerWidth) {
      left = tmid - Math.ceil(p.width / 2);
    } else if (t.left + p.width <= window.innerWidth) {
      // try align left edge with the trigger
      left = t.left + window.pageXOffset;
    } else {
      left = t.right - p.width + window.pageXOffset;
    }
    style = `top:${top}px;left:${left}px`;

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
        node.ownerDocument.removeEventListener('mousedown', listener);
        // node.ownerDocument.removeEventListener("keydown", onKeydown);
      },
    };
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
    <div class="popover" use:poped {style} role="menu" aria-labelledby="menubutton">
      <div class="action">
        <Button kind="icon" title="View and Edit">
          <span class="vh">View and Edit</span>
          <Edit size={14} />
        </Button>
        <Button kind="icon" title="Delete">
          <span class="vh">Delete</span>
          <Trash size={14} />
        </Button>
      </div>
      <div>
        <h4>Link</h4>
        <p class="clamp clamp-2">{bookmark.url}</p>
        <h4>Description</h4>
        <p class="clamp">{bookmark.desc}</p>
      </div>
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
    // border-radius: 1000px;
    padding: 10px;
    overflow: hidden;
    // border
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

  .action {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
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
