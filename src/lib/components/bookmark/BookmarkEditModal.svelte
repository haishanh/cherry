<script lang="ts">
  import Modal from '$lib/components/base/Modal.svelte';
  import BookmarkEditForm, { type Event0 } from '$lib/components/bookmark/BookmarkEditForm.svelte';
  import type { BookmarkFromDb } from '$lib/type';

  type Props = {
    onopen?: () => void;
    onclose?: () => void;
    onev0: (e: Event0) => void;
  };

  let { onopen, onclose, onev0 }: Props = $props();

  let modal: Modal;

  type Bookmark = Pick<BookmarkFromDb, 'url' | 'title' | 'desc'> & { id?: number };

  let bookmark: null | Bookmark = $state(null);

  export const open = (data: Bookmark) => {
    bookmark = data;
    modal.open();
    onopen?.();
  };

  export const openEmpty = () => open({ url: '', title: '', desc: '' });

  export const close = () => {
    modal.close();
    onclose?.();
  };
</script>

<Modal bind:this={modal}>
  {#if bookmark}
    <BookmarkEditForm {bookmark} {onev0} />
  {:else}
    <div>No bookmark selected</div>
  {/if}
</Modal>
