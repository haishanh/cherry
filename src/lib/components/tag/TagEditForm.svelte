<script lang="ts">
  const EVENT = {
    updatecompleted: 'updatecompleted',
  };

  import { createEventDispatcher } from 'svelte';

  import { updateTagClientSide } from '$lib/client/tag.store';
  import Button from '$lib/components/base/Button.svelte';
  import Field from '$lib/components/base/Field.svelte';
  import { addToast } from '$lib/components/base/toast/store';
  import type { TagFromDb } from '$lib/type';
  import { request, RequestError } from '$lib/utils/http.util';

  export let tag: TagFromDb;

  const dispatch = createEventDispatcher();

  async function updateTag(b: TagFromDb) {
    const id = b.id;
    let ret = await request({ url: '/api/tags/' + id, method: 'PATCH', data: b });
    return ret.data;
  }

  async function onSubmit() {
    try {
      await updateTag(tag);
      dispatch(EVENT.updatecompleted);
      updateTagClientSide(tag);
      addToast({ description: 'Tag renamed successfully', status: 'success' });
    } catch (err) {
      console.log('Update tag failed', err);
      if (err instanceof RequestError) {
        const response = err.response;
        if (response?.status === 409) {
          addToast({ description: 'Tag with this name already exists', status: 'warning' });
          return;
        }
      }
      addToast({ description: 'Something went wrong', status: 'error' });
    }
  }
</script>

<form on:submit|preventDefault={onSubmit}>
  <h2>Edit Tag</h2>
  <Field name="Name" type="text" placeholder="" bind:value={tag.name} />
  <div class="action">
    <Button type="submit">
      <span>Save</span>
    </Button>
  </div>
</form>

<style lang="scss">
  form h2 {
    margin: 0px 0 8px;
  }
  .action {
    margin-top: 15px;
  }
</style>
