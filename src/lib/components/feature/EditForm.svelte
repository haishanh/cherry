<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  import Button from '$lib/components/base/Button.svelte';
  import Field from '$lib/components/base/Field.svelte';
  import type { BookmarkFromDb } from '$lib/type';
  import { request } from '$lib/utils/http.util';

  export let bookmark: Pick<BookmarkFromDb, 'id' | 'url' | 'title' | 'desc'>;
  // event updatestart, updatefailed

  const dispatch = createEventDispatcher();

  function updateBookmark(opts: { id: string | number }) {
    return request({ url: '/api/bookmarks/' + bookmark.id, method: 'PATCH', data: opts });
  }

  async function onSubmit() {
    // make a copy
    const b = { ...bookmark };
    dispatch('updatestart', b);
    try {
      const ret = await updateBookmark(b);
      console.log(ret.data);
    } catch (err) {
      dispatch('updatefailed', b);
      console.log('Update bookmark failed');
      console.log(err);
    }
    // TODO
    // if success
    //   if has previous page: go back
    //   else show succes toast
  }
</script>

<form on:submit|preventDefault={onSubmit}>
  <Field name="Link" bind:value={bookmark.url} />
  <Field name="Title" bind:value={bookmark.title} />
  <Field name="Description" bind:value={bookmark.desc} type="textarea" placeholder="" />
  <div class="action">
    <Button type="submit">Save</Button>
  </div>
</form>

<style lang="scss">
  .action {
    margin-top: 20px;
  }
</style>
