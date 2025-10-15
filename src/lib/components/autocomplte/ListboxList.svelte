<script lang="ts" generics="Item extends { name: string }">
  import type { Snippet } from 'svelte';

  type Props = {
    autoSelect?: boolean;
    filtered: Item[];
    itemComp: Snippet<[Item]>;
    onconfirm?: (item: Item) => void;
    id: string;
  };

  let { id: idPrefix, autoSelect = false, filtered = [], itemComp, onconfirm }: Props = $props();

  let highlightedIdx = $state(autoSelect ? 0 : -1);

  $effect(() => {
    const highlighted = filtered[highlightedIdx];

    let idx = -1;
    if (highlighted) idx = filtered.findIndex((item) => item.name === highlighted.name);
    if (highlighted && idx >= 0) {
      if (highlightedIdx !== idx) highlightedIdx = idx;
    } else if (filtered.length > 0) {
      if (highlightedIdx !== 0 && autoSelect) highlightedIdx = 0;
    }

    ensureItemVisible(highlightedIdx);
  });

  let listbox: HTMLElement;
  function highlightItemAt(idx: number | string) {
    highlightedIdx = typeof idx === 'number' ? idx : parseInt(idx, 10);
    ensureItemVisible(highlightedIdx);
  }
  function highlightItemBelow() {
    if (highlightedIdx < 0) highlightedIdx = -1;
    highlightItemAt((highlightedIdx + 1) % filtered.length);
  }
  function highlightItemAbove() {
    if (highlightedIdx < 0) highlightedIdx = filtered.length;
    highlightItemAt((filtered.length + highlightedIdx - 1) % filtered.length);
  }

  // https://www.w3.org/TR/wai-aria-practices-1.1/examples/listbox/listbox-scrollable.html
  // https://www.w3.org/TR/wai-aria-practices-1.1/examples/listbox/js/listbox.js
  function ensureItemVisible(idx: number) {
    if (!listbox) return;

    const item = filtered[idx];
    if (!item) return;

    const id = idPrefix + '-' + item.name;
    if (listbox.scrollHeight > listbox.clientHeight) {
      // ele is element to be highlighted
      const ele = document.getElementById(id);
      if (!ele) return;
      const elementBottom = ele.offsetTop + ele.offsetHeight;
      const scrollBottom = listbox.clientHeight + listbox.scrollTop;
      // console.log(id, ele.offsetTop, ele.offsetHeight, listbox.clientHeight, listbox.scrollTop);
      if (elementBottom > scrollBottom) {
        listbox.scrollTop = elementBottom - listbox.clientHeight;
      } else if (ele.offsetTop < listbox.scrollTop) {
        listbox.scrollTop = ele.offsetTop;
      }
    }
  }

  function confirmItem(idx: number) {
    if (idx < 0) return;
    const selected = filtered[idx];
    if (!selected) return;
    onconfirm?.({ ...selected });
  }

  function handleClickItem(e: MouseEvent) {
    let idx = (e.currentTarget as HTMLElement).getAttribute('data-idx');
    if (!idx) return false;
    confirmItem(parseInt(idx, 10));
    return false;
  }

  let lastClientX = -1;
  let lastClientY = -1;
  function handleMouseEnterItem(e: MouseEvent) {
    const x = lastClientX;
    const y = lastClientY;
    lastClientX = e.clientX;
    lastClientY = e.clientY;
    // prevent highlightItemAt due to unintentional mouse movement
    if (Math.abs(x - e.clientX) < 1 || Math.abs(y - e.clientY) < 1) {
      return;
    }

    let idx = (e.currentTarget as HTMLElement).getAttribute('data-idx');
    if (!idx) return;
    highlightItemAt(idx);
  }

  function handleKeydown(e: KeyboardEvent) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        highlightItemBelow();
        return;
      case 'ArrowUp':
        e.preventDefault();
        highlightItemAbove();
        return;
      case 'Enter':
        if (highlightedIdx >= 0) {
          e.preventDefault();
          confirmItem(highlightedIdx);
        }
        return;
      default:
    }
  }

  function preventDefault<E extends UIEvent>(fn: (e: E) => void) {
    return function (event: E) {
      event.preventDefault();
      fn(event);
    };
  }
</script>

<svelte:window on:keydown={handleKeydown} />
<div class="listbox-wrapper">
  <ul
    role="listbox"
    tabindex="-1"
    bind:this={listbox}
    data-cherry-listbox
    aria-activedescendant={highlightedIdx >= 0 ? idPrefix + '-' + highlightedIdx : null}
  >
    {#each filtered as item, idx (item.name)}
      <li
        role="option"
        id="{idPrefix}-{item.name}"
        class:hi={idx === highlightedIdx}
        aria-selected={idx === highlightedIdx}
        data-idx={idx}
        onmousedown={preventDefault(handleClickItem)}
        onmouseenter={preventDefault(handleMouseEnterItem)}
      >
        {@render itemComp(item)}
      </li>
    {/each}
  </ul>
</div>

<style lang="scss">
  .listbox-wrapper {
    padding: 10px 0 10px 5px;
    position: absolute;
    top: calc(100% + 2px);
    left: 0;
    width: 95%;
    z-index: 1;
    background-color: var(--bg-card);

    border-radius: 7px;
    border: 1px solid transparent;
    border-color: hsl(0deg 0% var(--lightness));
    // prettier-ignore
    box-shadow: 0 1px 1px rgba(0,0,0,0.1),
                0 2px 2px rgba(0,0,0,0.1),
                0 4px 4px rgba(0,0,0,0.1),
                0 8px 10px rgba(0,0,0,0.1);
    @media (prefers-color-scheme: dark) {
      --lightness: 30%;
    }
    @media (prefers-color-scheme: light) {
      --lightness: 50%;
    }
  }
  ul {
    position: relative;
    list-style: none;
    margin: 0;
    padding: 0 5px 0 0;
    max-height: 150px;
    overflow-y: auto;
  }
  li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    line-height: 1;
    padding: 0 8px;
    border-radius: 7px;
    height: 30px;
    border: 1px solid transparent;
    cursor: pointer;
    &.hi {
      background-color: hsla(94deg, 99%, 33%, 0.4);
    }
  }
</style>
