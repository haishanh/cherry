<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  import Modal from '$lib/components/base/Modal.svelte';
  import BookmarkEditForm from '$lib/components/bookmark/BookmarkEditForm.svelte';
  import type { BookmarkFromDb } from '$lib/type';

  let modal: Modal;

  let bookmark: Pick<BookmarkFromDb, 'url' | 'title' | 'desc'> & { id?: number };

  const EVENT = {
    open: 'open',
    close: 'close',
  };

  const dispatch = createEventDispatcher();

  export const open = (data: typeof bookmark) => {
    bookmark = data;
    modal.open();
    dispatch(EVENT.open);
  };

  export const close = () => {
    modal.close();
    dispatch(EVENT.close);
  };
</script>

<Modal bind:this={modal}>
  <BookmarkEditForm {bookmark} on:ev0 />
</Modal>
