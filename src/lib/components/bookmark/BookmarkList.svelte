<script lang="ts">
  import { nanoid } from 'nanoid';

  import { afterNavigate, invalidate } from '$app/navigation';
  import { groupAddModal, groupSelectModal } from '$lib/client/modal.store';
  import { addToast, removeToast } from '$lib/components/base/toast/store';
  import BookmarkChip from '$lib/components/bookmark/BookmarkChip.svelte';
  import type EditModal from '$lib/components/bookmark/BookmarkEditModal.svelte';
  import BookmarkToolbar, {
    EVENT_TYPE as TOOLBAR_EVENT_TYPE,
    type EventType as ToolbarEventType,
  } from '$lib/components/bookmark/BookmarkToolbar.svelte';
  import GroupListModal from '$lib/components/home/GroupListModal.svelte';
  import Dock from '$lib/components/selection-dock/Dock.svelte';
  import type { BookmarkFromDb } from '$lib/type';
  import * as httpUtil from '$lib/utils/http.util';
  import type { DockOperation } from '../selection-dock/DockContent.svelte';

  type Group = { id: number; name: string; count?: number };

  type Props = {
    editModal?: EditModal | null;
    bookmarks: BookmarkFromDb[];
  };

  let { editModal, bookmarks = $bindable([]) }: Props = $props();

  let groupSelectModal0: GroupListModal;
  $effect(() => {
    groupSelectModal.set(groupSelectModal0);
  });

  type PendingDeleteState = {
    // The bookmarks removed by one delete action, keyed by stash/undo key.
    deleted: BookmarkFromDb[];
    // Original list position of each bookmark id at delete time.
    // Used to put restored bookmarks back near their previous place
    // instead of restoring the whole old list snapshot.
    positions: Record<number, number>;
  };

  let isArranging = $state(false);
  let pendingDeleteLookup: Record<string, PendingDeleteState> = $state({});
  let selectedBookmarkLookup: Record<number, boolean> = $state({});
  let selectedBookmarkCount = $derived(countTruthyValues(selectedBookmarkLookup));

  function countTruthyValues(o: Record<any, boolean>) {
    let v = 0;
    const allKeys = Object.keys(o);
    for (const k of allKeys) {
      if (o[k]) v += 1;
    }
    return v;
  }
  function retrieveTruthyKeys(o: Record<any, boolean>) {
    const keys = [];
    const allKeys = Object.keys(o);
    for (const k of allKeys) {
      if (o[k]) keys.push(k);
    }
    return keys;
  }
  function retrieveSelectedBookmarks(): number[] {
    const ids = retrieveTruthyKeys(selectedBookmarkLookup);
    return ids.map((i) => parseInt(i, 10));
  }

  type BookmarkId = number | string;

  function snapshotPendingDelete(key: string, ids: number[]) {
    const idSet = new Set(ids);
    const deleted: BookmarkFromDb[] = [];
    const positions: Record<number, number> = {};
    bookmarks.forEach((bookmark, idx) => {
      // Save every bookmark's current position so undo can merge the deleted
      // items back into roughly the same visual order.
      positions[bookmark.id] = idx;
      if (idSet.has(bookmark.id)) deleted.push(bookmark);
    });
    pendingDeleteLookup = { ...pendingDeleteLookup, [key]: { deleted, positions } };
  }

  function deleteBookmarksClient(key: string, ids: number[]) {
    snapshotPendingDelete(key, ids);
    let tmp: typeof bookmarks = [];
    for (const b of bookmarks) {
      if (ids.indexOf(b.id) >= 0) continue;
      tmp.push(b);
    }
    bookmarks = tmp;
  }

  function groupBookmarksClient(ids: number[], groupId: number) {
    bookmarks = bookmarks.map((bookmark) => (ids.indexOf(bookmark.id) >= 0 ? { ...bookmark, groupId } : bookmark));
  }

  function restoreBookmarksClient(key: string) {
    const pending = pendingDeleteLookup[key];
    if (!pending) return;

    const existingIds = new Set(bookmarks.map((bookmark) => bookmark.id));
    const merged = [...bookmarks];
    for (const bookmark of pending.deleted) {
      // Avoid duplicating an item if something else already put it back.
      if (!existingIds.has(bookmark.id)) merged.push(bookmark);
    }
    merged.sort((a, b) => {
      const pa = pending.positions[a.id];
      const pb = pending.positions[b.id];
      if (typeof pa === 'number' && typeof pb === 'number') return pa - pb;
      // If only one item has a known old position, prefer that one first.
      if (typeof pa === 'number') return -1;
      if (typeof pb === 'number') return 1;
      return 0;
    });
    bookmarks = merged;
    const { [key]: _removed, ...rest } = pendingDeleteLookup;
    pendingDeleteLookup = rest;
  }

  function handleEditBookmark(bookmark: BookmarkFromDb) {
    editModal?.open(bookmark);
  }

  async function groupBookmarksServer(ids: BookmarkId[], groupId: number) {
    const ret = await httpUtil.request({
      method: 'POST',
      url: `/api/bookmarks/operations/group`,
      data: { groupId, ids },
    });
    return ret.data.data;
  }

  async function deleteBookmarksServer(ids: BookmarkId[]) {
    const key = nanoid();
    await httpUtil.request({ method: 'POST', url: `/api/bookmarks/operations/stash`, data: { key, ids } });
    return { key };
  }

  async function restoreBookmarksServer(key: string) {
    return await httpUtil.request({ method: 'POST', url: `/api/bookmarks/operations/restore`, data: { key } });
  }

  async function deleteBookmarks(ids: number[]) {
    const { key } = await deleteBookmarksServer(ids);
    deleteBookmarksClient(key, ids);

    const restore = async () => {
      await restoreBookmarksServer(key);
      // optimistically restore only the deleted items for this undo operation
      restoreBookmarksClient(key);
      // reload page to make sure restored bookmarks have correct id
      await invalidate((url) => {
        // avoid reload ?random page
        if (url.searchParams.has('random')) return false;
        return true;
      });
    };

    let toastId: string;

    const undo = () => {
      return restore().then(
        () => {
          if (typeof toastId === 'string') removeToast(toastId);
        },
        (e) => {
          console.log(e);
          addToast({ description: 'Undo failed.', status: 'error' });
        },
      );
    };

    if (key && ids && ids.length > 0) {
      toastId = addToast({ description: 'Bookmark deleted.', action: { label: 'UNDO', fn: undo } });
    }
  }

  async function handleDeleteSingle(bookmarkId: number) {
    const ids = [bookmarkId];
    await deleteBookmarks(ids);
  }

  function resetMultiSelection() {
    selectedBookmarkLookup = {};
    activeIdx = null;
    isArranging = false;
  }

  let activeIdx: number | null = $state(null);
  afterNavigate(() => {
    // disallow cross-page selection
    // tho we can keep this state after user navigate to next page
    // but UX can be hard to get right
    resetMultiSelection();
  });

  function selectBookmark() {
    if (typeof activeIdx === 'number') {
      const bookmark = bookmarks[activeIdx];
      if (selectedBookmarkLookup[bookmark.id]) {
        delete selectedBookmarkLookup[bookmark.id];
      } else {
        selectedBookmarkLookup[bookmark.id] = true;
      }
      selectedBookmarkLookup = selectedBookmarkLookup;
    }
  }
  function activateNextBookmark() {
    if (typeof activeIdx !== 'number') {
      activeIdx = 0;
      // we enter da arranging mode yo
      isArranging = true;
    } else if (activeIdx < bookmarks.length - 1) {
      activeIdx = activeIdx + 1;
    }
  }
  function activatePrevBookmark() {
    if (typeof activeIdx === 'number' && activeIdx > 0) activeIdx = activeIdx - 1;
  }
  async function handleDeleteMulti() {
    const ids = retrieveSelectedBookmarks();
    resetMultiSelection();
    await deleteBookmarks(ids);
  }

  function handleKeydown(event: KeyboardEvent) {
    const active = document.activeElement;
    if (!active) return;
    const notSimple = event.metaKey || event.ctrlKey || event.shiftKey || event.isComposing;
    if (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA') return;
    if (document.querySelector('[data-cherry-modal-overlay]')) return;

    switch (event.key) {
      case 'x':
        if (notSimple) return;
        selectBookmark();
        break;
      case 'j':
      case 'l':
        if (notSimple) return;
        activateNextBookmark();
        break;
      case 'k':
      case 'h':
        if (notSimple) return;
        activatePrevBookmark();
        break;
      case '#':
        if (event.metaKey || event.ctrlKey || event.isComposing) return;
        handleDeleteMulti();
        break;
      case 'Escape':
        if (notSimple) return;
        resetMultiSelection();
        break;
      default:
    }
  }

  function handleEventFromDock({ op }: { op: DockOperation }) {
    if (op === 'delete') {
      handleDeleteMulti();
    } else if (op === 'cancel') {
      resetMultiSelection();
    }
  }
  function openEmptyEditModal() {
    editModal?.openEmpty();
  }
  function handleClickArrangeBookmarksButton() {
    isArranging = !isArranging;

    if (!isArranging) resetMultiSelection();
  }
  function handleClickAdd() {
    $groupAddModal?.open();
  }

  async function groupBookmarks(ids: number[], groupId: number) {
    const result = await groupBookmarksServer(ids, groupId);
    groupBookmarksClient(result.success, groupId);
  }
  async function handleSelectGroup(e: { group: Group }) {
    $groupSelectModal?.close();
    const ids = retrieveSelectedBookmarks();
    resetMultiSelection();
    const groupId = e.group.id;
    await groupBookmarks(ids, groupId);
  }

  function handleToolbarEvent0(e: { type: ToolbarEventType }) {
    const type = e.type;
    switch (type) {
      case TOOLBAR_EVENT_TYPE.ClickAddButton:
        openEmptyEditModal();
        break;
      case TOOLBAR_EVENT_TYPE.ClickArrangeButton:
        handleClickArrangeBookmarksButton();
        break;
      default:
        console.log('handleToolbarEvent0 unhandled event type', type);
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />
<BookmarkToolbar ev0={handleToolbarEvent0} />
<div class="list">
  {#each bookmarks as bookmark, idx (bookmark.id)}
    {#if bookmark.url && (bookmark.url.startsWith('https://') || bookmark.url.startsWith('http://'))}
      <BookmarkChip
        {bookmark}
        isSelectable={isArranging}
        isActive={idx === activeIdx}
        bind:isSelected={selectedBookmarkLookup[bookmark.id]}
        deleteBookmark={handleDeleteSingle}
        editBookmark={handleEditBookmark}
      />
    {/if}
  {/each}
</div>
{#if isArranging}
  <Dock count={selectedBookmarkCount} ondock={handleEventFromDock} />
{/if}

<GroupListModal bind:this={groupSelectModal0} itemAs="label" clickadd={handleClickAdd} select={handleSelectGroup} />

<style lang="scss">
  .list {
    font-size: 0.9em;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
</style>
