<script lang="ts">
  import { ChevronLeftIcon, ChevronRightIcon } from '@lucide/svelte';
  import { PAGINATION_SEARCH_PARAM_PLACEHOLDER_KEY } from './mod';

  type Props = {
    current: number;
    total: number;
    next: string;
    previous: string;
    pageUriTemplate?: string;
    maybeHasMore: boolean;
  };

  let {
    // current page
    current = 1,
    // total pages
    total = 1,
    next = '',
    previous = '',
    pageUriTemplate = '',
    maybeHasMore,
  }: Props = $props();

  type PaginationItem = { key: number; page: number } | { key: number; gap: boolean };

  let items: PaginationItem[] = $state(makeNavItems(total, current));
  previous = buildLink(current - 1);

  function buildLink(page: number) {
    return pageUriTemplate.replace(`${PAGINATION_SEARCH_PARAM_PLACEHOLDER_KEY}=`, 'p=' + page);
  }

  // 1 2 3 4 5 6 ... 100
  // ^
  // 1 .. 6 7 8 9 10 ... 100
  //          ^
  // 1 .. 95 96 97 98 99 100
  function makeNavItems(total: number, current: number) {
    if (total <= 0 || typeof total !== 'number') return [];
    let key = 0;
    let items: PaginationItem[] = [];
    const maxNumberOfItems = 7;
    if (total <= maxNumberOfItems) {
      for (let i = 1; i <= total; i++) {
        items.push({ page: i, key: key++ });
      }
    } else if (current - 1 <= maxNumberOfItems - 2) {
      for (let i = 1; i <= maxNumberOfItems - 1; i++) {
        items.push({ page: i, key: key++ });
      }
      items.push({ gap: true, key: key++ }, { page: total, key: key++ });
    } else if (total - current <= maxNumberOfItems - 2) {
      items.push({ page: 1, key: key++ }, { gap: true, key: key++ });
      for (let i = total - (maxNumberOfItems - 2); i <= total; i++) {
        items.push({ page: i, key: key++ });
      }
    } else {
      items.push({ page: 1, key: key++ }, { gap: true, key: key++ });
      for (let i = current - 2; i <= current + 2; i++) {
        items.push({ page: i, key: key++ });
      }
      items.push({ gap: true, key: key++ }, { page: total, key: key++ });
    }
    return items;
  }
</script>

{#if (total && total > 1) || maybeHasMore}
  <div class="pagination" role="navigation" aria-label="Pagination">
    {#if current === 1}
      <span class="item disabled"><ChevronLeftIcon size={20} /><span>Previous</span></span>
    {:else}
      <a class="item" rel="prev" href={previous}><ChevronLeftIcon size={20} /><span>Previous</span></a>
    {/if}

    {#each items as item (item.key)}
      {#if 'page' in item}
        {#if item.page === current}
          <span class="current item desktop">{item.page}</span>
        {:else}
          <a class="item desktop" href={buildLink(item.page)}>{item.page}</a>
        {/if}
      {:else if item.gap}
        <span class="item desktop gap">…</span>
      {/if}
    {/each}

    {#if total <= 0 && maybeHasMore}
      <a class="item" rel="next" href={next}><span>Next</span><ChevronRightIcon size={20} /></a>
    {:else if current >= total}
      <span class="item disabled"><span>Next</span><ChevronRightIcon size={20} /></span>
    {:else}
      <a class="item" rel="next" href={next}><span>Next</span><ChevronRightIcon size={20} /></a>
    {/if}
  </div>
{/if}

<style lang="scss">
  .pagination {
    padding: 25px 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 3px;

    .item {
      border: 1px solid transparent;
      height: 35px;
      min-width: 35px;
      padding: 6px 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 200px;
      text-decoration: none;
      color: inherit;
      cursor: pointer;
      user-select: none;
      display: inline-flex;
      align-items: center;
      @media (prefers-color-scheme: dark) {
        --lightness: 30%;
      }
      @media (prefers-color-scheme: light) {
        --lightness: 50%;
      }
      &:hover {
        border-color: hsl(0deg 0% var(--lightness));
        background-color: var(--bg-card);
      }
    }
    .disabled {
      color: var(--color-text-disabled);
      cursor: default;
      background-color: transparent;
      &:hover {
        background-color: transparent;
        border-color: transparent;
      }
    }
    .current,
    .current:hover {
      background-color: var(--accent);
      border-color: var(--accent);
      color: #f7f7f7;
    }
    [rel='prev'],
    [rel='next'] {
      color: var(--accent);
    }
    .gap {
      color: var(--color-text-disabled);
    }

    @media (max-width: 640px) {
      .desktop {
        display: none;
      }
    }
  }
</style>
