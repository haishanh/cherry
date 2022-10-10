<script lang="ts">
  import { onMount } from 'svelte';

  import { fetchGroups } from '$lib/client/group.store';
  import { fetchTags } from '$lib/client/tag.store';
  import { addToast } from '$lib/components/base/toast/store';
  import {
    type Event0 as BEFEvent0,
    Event0Type as BEFEvent0Type,
  } from '$lib/components/bookmark/BookmarkEditForm.svelte';
  import BookmarkEditModal from '$lib/components/bookmark/BookmarkEditModal.svelte';
  import BookmarkList from '$lib/components/bookmark/BookmarkList.svelte';
  import BookmarkToolbar, { EVENT_TYPE as TOOLBAR_EVENT_TYPE } from '$lib/components/bookmark/BookmarkToolbar.svelte';
  import GroupSideBar from '$lib/components/home/GroupSideBar.svelte';
  import SearchForm from '$lib/components/SearchForm.svelte';
  import type { BookmarkFromDb, PageMetaBookmarks } from '$lib/type';
  import { RequestError } from '$lib/utils/http.util';

  import Empty from './home/Empty.svelte';
  import Pagination from './pagination/Pagination.svelte';

  export let bookmarks: BookmarkFromDb[] = [];
  // TODO merge this with meta?
  export let totalPage: number;
  export let meta: PageMetaBookmarks = {};
  export let url: { pathname: string; search: string };

  let editModal: BookmarkEditModal;

  onMount(() => {
    fetchTags({ initial: true });
    fetchGroups({ initial: true });
  });

  function handleBookmarkEditModalEv0(e: BEFEvent0) {
    const type = e.detail?.type;
    switch (type) {
      case BEFEvent0Type.UpdateCompleted:
        handleBookmarkUpdateCompleted(e.detail?.payload);
        break;
      case BEFEvent0Type.CreateCompleted:
        handleBookmarkCreateCompleted(e.detail?.payload);
        break;
      case BEFEvent0Type.UpdateFailed:
        handleBookmarkUpdateFailed(e.detail?.payload);
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
    editModal.close();
  }

  function handleBookmarkCreateCompleted(bookmark: BookmarkFromDb) {
    bookmarks.unshift(bookmark);
    bookmarks = bookmarks;
    editModal.close();
  }

  function handleBookmarkUpdateFailed(e: { bookmark: BookmarkFromDb; error: any }) {
    editModal.close();
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

  function handleToolbarEvent0(e: CustomEvent<{ type: TOOLBAR_EVENT_TYPE }>) {
    const type = e.detail?.type;
    switch (type) {
      case TOOLBAR_EVENT_TYPE.ClickAddButton:
        editModal.openEmpty();
        break;
      default:
        console.log('handleToolbarEvent0 unhandled event type', type);
    }
  }

  // pagination

  let q: URLSearchParams;
  let pageCurrent: number;
  let pageUriTemplate: string;
  let pageUriNext: string;
  let pageTotal: number;
  let groupId: number | null;

  $: {
    q = new URLSearchParams(url.search);
    pageCurrent = q.get('p') ? parseInt(q.get('p') || '', 10) : 1;
    groupId = q.get('group') ? parseInt(q.get('group') || '', 10) : null;
    q.delete('p');
    q.delete('after');
    q.set('____', '');
    pageUriTemplate = `${url.pathname}?${q}`;
    pageUriNext = pageUriTemplate.replace(
      '____=',
      meta.after ? `after=${meta.after}&p=${pageCurrent + 1}` : `p=${pageCurrent + 1}`
    );
    pageTotal = totalPage;
  }
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
      <BookmarkToolbar tools={['add']} on:ev0={handleToolbarEvent0} />
      <Empty />
    {/if}
    <BookmarkEditModal bind:this={editModal} on:ev0={handleBookmarkEditModalEv0} />
    <Pagination {pageUriTemplate} previous="" next={pageUriNext} current={pageCurrent} total={pageTotal} />
  </div>
  <div />
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
