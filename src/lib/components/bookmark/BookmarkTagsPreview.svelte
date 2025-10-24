<script lang="ts">
  import { tagMapById } from '$lib/client/tag.store';
  import type { TagType } from '$lib/type';

  import SimpleTag from './SimpleTag.svelte';

  type Props = {
    tagIds: number[];
  };

  let { tagIds = [] }: Props = $props();

  let tags: TagType[] = hydrateTags(tagIds);

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
