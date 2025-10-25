<script lang="ts">
  import { Trash } from '@lucide/svelte';

  import { deleteGroupClientSide } from '$lib/client/group.store';
  import Button from '$lib/components/base/Button.svelte';
  import Modal from '$lib/components/base/Modal.svelte';
  import { addToast } from '$lib/components/base/toast/store';
  import { request } from '$lib/utils/http.util';

  type Group = { id: number; name: string };

  let modal: Modal;
  let group: Group | undefined = $state();

  export const open = (g: Group) => {
    group = g;
    modal.open();
  };

  export const close = () => {
    modal.close();
  };

  async function deleteGroup(d: Group) {
    await deleteGroupServerSide(d);
    deleteGroupClientSide(d);
  }

  async function deleteGroupServerSide(d: Group) {
    const ret = await request({ url: '/api/groups/' + d.id, method: 'DELETE' });
    return ret.data;
  }

  async function handleClickDelete() {
    if (!group || !group.id) return;
    try {
      await deleteGroup({ ...group });
      close();
      addToast({ description: 'Group deleted' });
    } catch (err) {
      console.log('Delete group error', err);
      addToast({ description: 'Something went wrong', status: 'error' });
    }
  }
</script>

<Modal bind:this={modal}>
  {#if group}
    <div class="cnt">
      <h2>Delete group "{group?.name}"?</h2>
      <p>Note, all bookmarks in this group will be kept.</p>
      <div class="action">
        <Button modifier={['warn']} onclick={handleClickDelete}>
          {#snippet icon()}
            <Trash size={16} />
          {/snippet}

          <span>Delete</span>
        </Button>
      </div>
    </div>
  {:else}
    <div class="cnt">Something went wrong</div>
  {/if}
</Modal>

<style lang="scss">
  .cnt {
    padding: 10px 15px;
    p {
      background-color: hsl(94deg 99% 33% / 12%);
      color: var(--accent);
      padding: 15px 10px;
      font-size: 0.95em;
      border-radius: 7px;
    }
  }
  .action {
    margin-top: 20px;
  }
</style>
