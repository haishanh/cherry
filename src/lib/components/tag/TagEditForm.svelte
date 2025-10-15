<script lang="ts">
  import { updateTagClientSide } from '$lib/client/tag.store';
  import Button from '$lib/components/base/Button.svelte';
  import Field from '$lib/components/base/Field.svelte';
  import { addToast } from '$lib/components/base/toast/store';
  import type { TagFromDb } from '$lib/type';
  import { request, RequestError } from '$lib/utils/http.util';

  type Props = {
    updatecompleted: () => void;
    tag: TagFromDb;
  };

  let { updatecompleted, tag }: Props = $props();

  async function updateTag(b: TagFromDb) {
    const id = b.id;
    let ret = await request({ url: '/api/tags/' + id, method: 'PATCH', data: b });
    return ret.data;
  }

  async function onSubmit(e: Event) {
    e.preventDefault();
    try {
      await updateTag(tag);
      updatecompleted();
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

<form onsubmit={onSubmit}>
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
