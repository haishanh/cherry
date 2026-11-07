<script lang="ts">
  import { tagMapById } from '#lib/client/tag.store.js';
  import type { TagType } from '#lib/type.js';

  import SimpleTag from './SimpleTag.svelte';

  type Props = {
    tagIds: number[];
  };

  let { tagIds = [] }: Props = $props();

  let tags: TagType[] = $derived(hydrateTags(tagIds));

  function hydrateTags(ids: number[]) {
    if (ids && ids.length > 0 && typeof ids[0] === 'number') {
      const byId = $tagMapById;
      return ids.map((id) => byId.get(id)!);
    }
    return [];
  }
</script>

<div class="tags">
  {#each tags as tag (tag.id)}
    <SimpleTag {tag} />
  {/each}
</div>

<style lang="scss">
  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }
</style>
