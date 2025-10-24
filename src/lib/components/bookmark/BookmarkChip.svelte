<script lang="ts">
  import { afterNavigate } from '$app/navigation';
  import { env } from '$env/dynamic/public';
  import Popover from '$lib/components/base/popover/Popover.svelte';
  import PopoverAction from '$lib/components/bookmark-chip/PopoverAction.svelte';
  import type { BookmarkFromDb } from '$lib/type';
  import { untrack } from 'svelte';

  import BookmarkTagsPreview from './BookmarkTagsPreview.svelte';
  import { SquareCheckBig, SquareIcon } from '@lucide/svelte';

  type Props = {
    deleteBookmark: (id: number) => void;
    editBookmark: (bookmark: BookmarkFromDb) => void;
    bookmark: BookmarkFromDb;
    isSelected?: boolean;
    isActive?: boolean;
    isSelectable?: boolean;
  };

  let {
    deleteBookmark,
    editBookmark,
    bookmark,
    isSelected = $bindable(),
    isActive = false,
    isSelectable = false,
  }: Props = $props();

  let isOpen = $state(false);
  let node: HTMLElement;

  afterNavigate(close);

  $effect(() => {
    if (isActive) {
      untrack(() => deferOpen(1400));
      // ensure in view
      ensureMenuItemVisible();
    } else {
      untrack(deferClose);
    }
  });

  let anchor: HTMLElement | null = $state(null);
  let popoverPlace = $state('north');

  let openTimeoutId: ReturnType<typeof setTimeout>;
  let closeTimeoutId: ReturnType<typeof setTimeout>;

  function ensureMenuItemVisible() {
    if (!node) return;

    const parent = document.documentElement;
    const inView =
      node.offsetTop + node.offsetHeight < parent.clientHeight + parent.scrollTop && node.offsetTop > parent.scrollTop;

    if (!inView) {
      // scrollIntoView probably is also a good option
      // https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
      // node.scrollIntoView({ behavior: "smooth" });
      const scrollTop = node.offsetTop - Math.ceil(parent.clientHeight / 2);
      // parent.scrollTop = node.offsetTop - Math.ceil(pClientHeight / 2);
      window.scrollTo({ top: scrollTop, behavior: 'smooth' });
    }
  }

  function open() {
    if (!isOpen) isOpen = true;
  }
  function close() {
    if (isOpen) isOpen = false;
  }
  function deferOpen(delay = 700) {
    if (closeTimeoutId) clearTimeout(closeTimeoutId);
    if (isOpen) return;
    if (openTimeoutId) clearTimeout(openTimeoutId);
    openTimeoutId = setTimeout(open, delay);
  }
  function deferClose(delay = 750) {
    if (openTimeoutId) clearTimeout(openTimeoutId);
    if (!isOpen) return;
    if (closeTimeoutId) clearTimeout(closeTimeoutId);
    closeTimeoutId = setTimeout(close, delay);
  }
  function handleItemOnMouseEnter() {
    deferOpen(700);
  }
  function handleItemOnMouseLeave() {
    deferClose(250);
  }
  function handlePopoverOnMouseEnter() {
    deferOpen(700);
  }
  function handlePopoverOnMouseLeave() {
    deferClose(750);
  }
  function closePopup() {
    isOpen = false;
  }

  function handlePopoverPositionChange(e: { placement: string }) {
    const placement = e.placement;
    popoverPlace = placement;
  }

  async function handleDelete() {
    if (!bookmark) return;
    deleteBookmark(bookmark.id);
  }

  async function handleEdit() {
    if (!bookmark) return;
    closePopup();
    editBookmark(bookmark);
  }

  function buildFavionUrl(bookmark: BookmarkFromDb) {
    let template = env.PUBLIC_ICON_SERVICE || '/api/favicon/{}';
    return template.replace('{}', new URL(bookmark.url).hostname);
  }
  function formatTimestamp(a: number) {
    const t = new Date(a * 1000);
    const month = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.'];
    return month[t.getMonth()] + ' ' + t.getDate() + ', ' + t.getFullYear();
  }
</script>

<div bind:this={node} class="chip" class:isSelected>
  <a
    class:isOpen
    class:isSelected
    class:isActive
    href={bookmark.url}
    target="_blank"
    rel="noopener noreferrer"
    bind:this={anchor}
    onmouseenter={handleItemOnMouseEnter}
    onmouseleave={handleItemOnMouseLeave}
  >
    <span class="favicon">
      <img width="20" height="20" loading="lazy" alt="Bookmark Icon" src={`${buildFavionUrl(bookmark)}`} />
    </span>
    <span>{bookmark.title}</span>
  </a>

  {#if isSelectable}
    <label class="check">
      <input type="checkbox" bind:checked={isSelected} />
      {#if isSelected}
        <SquareCheckBig size={16} />
      {:else}
        <SquareIcon size={16} />
      {/if}
    </label>
  {/if}

  <Popover
    bind:isOpen
    {anchor}
    close={closePopup}
    mouseenter0={handlePopoverOnMouseEnter}
    mouseleave0={handlePopoverOnMouseLeave}
    position={handlePopoverPositionChange}
  >
    <div class="popover-wrap">
      <div>
        <p class="clamp clamp-2">{bookmark.url}</p>
        <p class="clamp">{bookmark.desc}</p>
      </div>
      <div><BookmarkTagsPreview tagIds={bookmark.tagIds || []} /></div>
      {#if bookmark.createdAt}
        <div><p><span class="createdAt">{formatTimestamp(bookmark.createdAt)}</span></p></div>
      {/if}
      <div class:place-top={popoverPlace === 'south'} class:place-bottom={popoverPlace === 'north'}>
        <PopoverAction onclose={closePopup} ondelete={handleDelete} onedit={handleEdit} />
      </div>
    </div>
  </Popover>
</div>

<style lang="scss">
  .chip {
    position: relative;
    &:hover .check {
      background-color: var(--bg-card);
      border: 1px solid var(--color-v0);
    }
  }
  .chip.isSelected {
    .check {
      visibility: hidden;
    }
    &:hover {
      .check {
        visibility: visible;
      }
    }
  }
  .check {
    position: absolute;
    left: 0;
    top: 0;
    transform: translate(-40%, -30%);
    --size: 30px;
    height: var(--size);
    width: var(--size);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 36px;
    color: var(--accent);
    &:focus-within {
      border-color: var(--accent);
    }
    input {
      position: absolute;
      opacity: 0;
      cursor: pointer;
      height: 0;
      width: 0;
    }
    // input:checked ~ .checkmark {
    //   background-color: #2196f3;
    // }
  }
  a {
    text-decoration: none;
    color: inherit;
    display: flex;
    align-items: center;
    gap: 10px;
    background-color: var(--bg-card);
    padding: 10px;
    border-radius: 21px;
    border: 1px solid transparent;
    outline: none;
    word-break: break-all;
    &:focus {
      border-color: hsl(0deg 0% var(--lightness));
      @media (prefers-color-scheme: dark) {
        --lightness: 30%;
      }
      @media (prefers-color-scheme: light) {
        --lightness: 50%;
      }
    }
    &.isOpen {
      border-color: hsl(0deg 0% var(--lightness));
      @media (prefers-color-scheme: dark) {
        --lightness: 30%;
      }
      @media (prefers-color-scheme: light) {
        --lightness: 50%;
      }
    }
    &.isActive {
      background-color: var(--bg-card-hover);
    }

    @media (prefers-color-scheme: dark) {
      --bg-selected: hsl(94deg 100% 23%);
      --bg-selected-active: hsl(94deg 99% 33%);
    }
    @media (prefers-color-scheme: light) {
      --bg-selected: hsl(94deg 99% 33%);
      --bg-selected-active: hsl(94deg 100% 23%);
    }

    &.isSelected {
      background-color: var(--bg-selected);
      color: #eee;
    }
    &.isActive.isSelected {
      background-color: var(--bg-selected-active);
    }
  }

  .favicon {
    width: 20px;
    height: 20px;
    img {
      height: auto;
    }
  }

  .popover-wrap {
    display: grid;
    grid-template-rows: auto auto;

    .place-top {
      grid-row: 1 / 2;
    }
    .place-bottom {
      grid-row: 2 / 3;
    }

    p {
      margin-block: 8px;
    }
    p:nth-child(1) {
      font-size: 0.9em;
    }
    .createdAt {
      font-size: 0.9em;
      color: var(--color-text3);
    }
  }

  .clamp {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    line-clamp: 3;
    -webkit-line-clamp: 3;
    overflow: hidden;
    overflow-wrap: anywhere;
  }
  .clamp-2 {
    line-clamp: 2;
    -webkit-line-clamp: 2;
  }
</style>
