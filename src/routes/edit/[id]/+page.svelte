<script lang="ts">
  import { onMount } from 'svelte';

  import { fetchGroups } from '$lib/client/group.store';
  import { fetchTags } from '$lib/client/tag.store';
  import CherryLeaf from '$lib/components/base/CherryLeaf.svelte';
  import { addToast } from '$lib/components/base/toast/store';
  import BookmarkEditForm, {
    Event0Type as BookmarkEditFormEvent,
  } from '$lib/components/bookmark/BookmarkEditForm.svelte';

  import type { PageData } from './$types';
  type Props = {
    data: PageData;
  };
  let { data }: Props = $props();

  const bookmark = data.bookmark;

  onMount(() => {
    fetchTags({ initial: true });
    fetchGroups({ initial: true });
  });

  function handleBookmarkEditFormEv0(e: { type: BookmarkEditFormEvent }) {
    const type = e.type;
    switch (type) {
      case BookmarkEditFormEvent.UpdateCompleted:
        addToast({ description: 'Saved', status: 'success' });
        break;
      case BookmarkEditFormEvent.UpdateFailed:
        addToast({ description: 'Something went wrong', status: 'error' });
        break;
    }
  }
</script>

<main>
  {#if bookmark}
    <h1>Edit</h1>
    <section>
      <BookmarkEditForm {bookmark} onev0={handleBookmarkEditFormEv0} />
    </section>
  {:else}
    <h2>Bookmark Not Found</h2>
    <div>
      <CherryLeaf />
    </div>
  {/if}
</main>

<style lang="scss">
  main {
    max-width: 900px;
    margin: 0 auto;
    padding: 15px;
  }

  section {
    margin: 16px 0;
  }
</style>
