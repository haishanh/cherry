<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  import Modal from '$lib/components/base/Modal.svelte';
  import TagEditForm from '$lib/components/tag/TagEditForm.svelte';
  import type { TagFromDb } from '$lib/type';

  const EVENT = {
    open: 'open',
    close: 'close',
  };

  let modal: Modal;
  let tag: TagFromDb;

  const dispatch = createEventDispatcher();

  export const open = (data: { tag: TagFromDb }) => {
    tag = data.tag;
    modal.open();
    dispatch(EVENT.open);
  };

  export const close = () => {
    modal.close();
    dispatch(EVENT.close);
  };
</script>

<Modal bind:this={modal}>
  <TagEditForm {tag} on:updatecompleted />
</Modal>
