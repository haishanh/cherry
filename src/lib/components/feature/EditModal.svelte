<script lang="ts">
  import type { BookmarkFromDb } from '$lib/type';

  import Modal from '../base/Modal.svelte';
  import EditForm from './EditForm.svelte';

  let modal: Modal;

  let bookmark: Pick<BookmarkFromDb, 'id' | 'url' | 'title' | 'desc'>;

  export const open = (data: typeof bookmark) => {
    bookmark = data;
    modal.open();
  };

  export const close = () => {
    modal.close();
  };
</script>

<Modal bind:this={modal}>
  <EditForm {bookmark} on:updatestart on:updatefailed />
</Modal>

<style lang="scss">
</style>
