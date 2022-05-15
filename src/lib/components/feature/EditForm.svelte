<script lang="ts">
  import Button from '$lib/components/base/Button.svelte';
  import Field from '$lib/components/base/Field.svelte';
  import type { BookmarkFromDb } from '$lib/type';
  import { request } from '$lib/utils/http.util';

  export let bookmark: Pick<BookmarkFromDb, 'id' | 'url' | 'title' | 'desc'>;

  async function updateBookmark(opts: { id: string | number }) {
    await request({ url: '/api/bookmarks/' + bookmark.id, method: 'PATCH', data: opts });
  }

  async function onSubmit() {
    const ret = await updateBookmark(bookmark);
    // eslint-disable-next-line no-console
    console.log(ret);
    // TODO
    // if success
    //   if has previous page: go back
    //   else show succes toast
  }
</script>

<form on:submit|preventDefault={onSubmit}>
  <Field name="Link" bind:value={bookmark.url} />
  <Field name="Title" bind:value={bookmark.title} />
  <Field name="Description" bind:value={bookmark.desc} type="textarea" />
  <div class="action">
    <Button type="submit">Save</Button>
  </div>
</form>

<style lang="scss">
  .action {
    margin-top: 20px;
  }
</style>
