<script lang="ts">
  import { createGroup, updateGroupClientSide } from '$lib/client/group.store';
  import Button from '$lib/components/base/Button.svelte';
  import Modal from '$lib/components/base/Modal.svelte';
  import { addToast } from '$lib/components/base/toast/store';
  import { request, RequestError } from '$lib/utils/http.util';
  import { SaveIcon } from '@lucide/svelte';

  import Field from '../base/Field.svelte';

  let modal: Modal;

  type Group = { id: number; name: string };
  type NewGroup = { name: string };

  let group: Group | NewGroup | undefined = $state();

  async function updateGroup(d: Group) {
    await updateGroupServerSide(d);
    updateGroupClientSide(d);
  }

  async function updateGroupServerSide(d: Group) {
    const ret = await request({ url: '/api/groups/' + d.id, method: 'PATCH', data: { name: d.name } });
    return ret.data;
  }

  export const open = (g?: Group) => {
    group = g ?? { name: '' };
    modal.open();
  };

  export const close = () => {
    group = { name: '' };
    modal.close();
  };

  async function onSubmit(e: SubmitEvent) {
    e.preventDefault();

    if (!group?.name) return;

    try {
      if (group) {
        if ('id' in group) {
          await updateGroup(group);
          addToast({ description: 'Group renamed', status: 'success' });
        } else {
          await createGroup(group);
          addToast({ description: 'Group created', status: 'success' });
        }
      }
      close();
    } catch (err) {
      console.log('update or create group error', err);
      if (err instanceof RequestError) {
        const response = err.response;
        if (response?.status === 409) {
          addToast({ description: 'Group with this name already exists', status: 'warning' });
          return;
        }
      }
      addToast({ description: 'Something went wrong', status: 'error' });
    }
  }
</script>

<Modal bind:this={modal}>
  {#if group}
    <form onsubmit={onSubmit}>
      {#if group && 'id' in group}
        <h2>Edit Group</h2>
      {:else}
        <h2>Add New Group</h2>
      {/if}
      <Field name="Name" placeholder="" bind:value={group.name} />
      <div class="action">
        <Button type="submit">
          {#snippet icon()}
            <SaveIcon size={16} />
          {/snippet}

          <span>Save</span>
        </Button>
      </div>
    </form>
  {:else}
    <div>Something went wrong</div>
  {/if}
</Modal>

<style lang="scss">
  form {
    padding: 10px;
    padding-top: 0;
    h2 {
      margin-bottom: 15px;
    }
  }
  .action {
    margin-top: 20px;
  }
</style>
