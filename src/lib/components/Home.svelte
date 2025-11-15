<script lang="ts">
  import { onMount } from 'svelte';

  import { fetchGroups } from '$lib/client/group.store';
  import { fetchTags } from '$lib/client/tag.store';
  import { addToast } from '$lib/components/base/toast/store';
  import { Event0Type as BEFEvent0Type, type Event0 } from '$lib/components/bookmark/BookmarkEditForm.svelte';
  import BookmarkEditModal from '$lib/components/bookmark/BookmarkEditModal.svelte';
  import BookmarkList from '$lib/components/bookmark/BookmarkList.svelte';
  import BookmarkToolbar, { EVENT_TYPE as TOOLBAR_EVENT_TYPE } from '$lib/components/bookmark/BookmarkToolbar.svelte';
  import GroupSideBar from '$lib/components/home/GroupSideBar.svelte';
  import SearchForm from '$lib/components/SearchForm.svelte';
  import type { BookmarkFromDb, PageMetaBookmarks } from '$lib/type';
  import { RequestError } from '$lib/utils/http.util';

  import Empty from './home/Empty.svelte';
  import Pagination from './pagination/Pagination.svelte';
  import { PAGINATION_SEARCH_PARAM_PLACEHOLDER_KEY } from './pagination/mod';

  type Props = {
    bookmarks: BookmarkFromDb[];
    totalPage: number;
    maybeHasMore: boolean;
    meta: PageMetaBookmarks;
    url: { pathname: string; search: string };
  };

  let { bookmarks = [], totalPage, maybeHasMore, meta, url }: Props = $props();

  let editModal: BookmarkEditModal | null = $state(null);

  onMount(() => {
    fetchTags({ initial: true });
    fetchGroups({ initial: true });
  });

  function handleBookmarkEditModalEv0(e: Event0) {
    const type = e.type;
    switch (type) {
      case BEFEvent0Type.UpdateCompleted:
        handleBookmarkUpdateCompleted(e.payload);
        break;
      case BEFEvent0Type.CreateCompleted:
        handleBookmarkCreateCompleted(e.payload);
        break;
      case BEFEvent0Type.UpdateFailed:
        handleBookmarkUpdateFailed(e.payload);
        break;
    }
  }

  function handleBookmarkUpdateCompleted(bookmark: BookmarkFromDb) {
    const idx = bookmarks.findIndex((item) => item.id === bookmark.id);

    if (idx < 0) return;

    // do no change the order of the list
    bookmarks.splice(idx, 1, bookmark);

    // or if we want to put newly udpated item to top, we can:
    // bookmarks.splice(idx, 1);
    // bookmarks.splice(0, 0, bookmark);

    bookmarks = bookmarks;
    editModal?.close();
  }

  function handleBookmarkCreateCompleted(bookmark: BookmarkFromDb) {
    bookmarks.unshift(bookmark);
    bookmarks = bookmarks;
    editModal?.close();
  }

  function handleBookmarkUpdateFailed(e: { bookmark: unknown; error: any }) {
    editModal?.close();
    const error = e.error;
    if (error && error instanceof RequestError) {
      const response = error.response;
      if (response?.status === 409) {
        addToast({ description: 'Bookmark already exists.', status: 'warning' });
        return;
      }
    }
    addToast({ description: 'Something went wrong.', status: 'error' });
  }

  function handleToolbarEvent0(e: { type: TOOLBAR_EVENT_TYPE }) {
    const type = e.type;
    switch (type) {
      case TOOLBAR_EVENT_TYPE.ClickAddButton:
        editModal?.openEmpty();
        break;
      default:
        console.log('handleToolbarEvent0 unhandled event type', type);
    }
  }

  // pagination
  const q = $derived(new URLSearchParams(url.search));
  const pageCurrent = $derived(q.get('p') ? parseInt(q.get('p') || '', 10) : 1);
  const groupId = $derived(q.get('group') ? parseInt(q.get('group') || '', 10) : null);
  const pageUriTemplate = $derived.by(() => {
    q.delete('p');
    q.delete('after');
    q.set(PAGINATION_SEARCH_PARAM_PLACEHOLDER_KEY, '');
    return `${url.pathname}?${q}`;
  });
  const pageUriNext = $derived.by(() => {
    const pageSp = meta.after ? `after=${meta.after}&p=${pageCurrent + 1}` : `p=${pageCurrent + 1}`;
    return pageUriTemplate.replace(`${PAGINATION_SEARCH_PARAM_PLACEHOLDER_KEY}=`, pageSp);
  });
</script>

<div class="root">
  <aside>
    <GroupSideBar {groupId} pathname="/settings/about" />
  </aside>
  <div class="main">
    <div class="action">
      <div class="search">
        <SearchForm />
      </div>
    </div>
    {#if bookmarks.length > 0}
      <BookmarkList bind:bookmarks {editModal} />
    {:else}
      <BookmarkToolbar tools={['add']} ev0={handleToolbarEvent0} />
      <Empty />
    {/if}
    <BookmarkEditModal bind:this={editModal} onev0={handleBookmarkEditModalEv0} />
    <Pagination
      {pageUriTemplate}
      previous=""
      next={pageUriNext}
      current={pageCurrent}
      total={totalPage}
      {maybeHasMore}
    />
  </div>
  <div></div>
</div>

<style lang="scss">
  .root {
    margin: 0 auto;
    padding: 0 15px 15px;

    @media (min-width: 1200px) {
      display: grid;
      grid-template-columns: minmax(100px, 1fr) 1000px minmax(100px, 1fr);
      gap: 10px;
    }
  }
  aside {
    display: flex;
    justify-content: flex-end;
  }
  .main {
    max-width: 1000px;
  }
  .action {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    justify-content: center;
  }
  .search {
    max-width: 800px;
    flex: 1;
  }
</style>
