<script lang="ts">
  import Modal from '$lib/components/base/Modal.svelte';
  import TagEditForm from '$lib/components/tag/TagEditForm.svelte';
  import type { TagFromDb } from '$lib/type';

  type Props = {
    onopen?: () => void;
    onclose?: () => void;
    updatecompleted: () => void;
  };

  let { onopen, onclose, updatecompleted }: Props = $props();

  let modal: Modal;
  let tag: TagFromDb | null = $state(null);

  export const open = (data: { tag: TagFromDb }) => {
    tag = data.tag;
    modal.open();
    onopen?.();
  };

  export const close = () => {
    modal.close();
    onclose?.();
  };
</script>

<Modal bind:this={modal}>
  {#if tag}
    <TagEditForm {tag} {updatecompleted} />
  {/if}
</Modal>
