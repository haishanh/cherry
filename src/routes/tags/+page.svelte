<script lang="ts">
  import { onMount } from 'svelte';

  import { tagList } from '$lib/client/tag.store';
  import Tag from '$lib/components/Tag.svelte';
  import NoTags from '$lib/components/tag/NoTags.svelte';
  import TagEditModal from '$lib/components/tag/TagEditModal.svelte';
  import type { TagFromDb } from '$lib/type';

  import type { PageData } from './$types';

  type Props = {
    data: PageData;
  };
  let { data }: Props = $props();

  let editModal: TagEditModal | undefined = $state();
  let grouped: { keys: string[]; lookup: Record<string, TagFromDb[]> } | undefined = $state();
  let loaded = $state(false);

  onMount(() => {
    tagList.set(data.tags);
    loaded = true;
  });

  $effect(() => {
    if (loaded) grouped = grouping($tagList);
  });

  type TagType = { id: number; name: string };

  function initialOf(name: string | undefined) {
    if (!name) return '-';
    let len = name.length;
    for (let i = 0; i < len; i++) {
      const cp = name.codePointAt(i);
      // [33, 126] -> printabel ascii chars (exclude "space", codepoint 32)
      if (cp && cp >= 33 && cp <= 126) return String.fromCodePoint(cp).toLowerCase();
    }
    return '-';
  }

  function grouping(tagList: TagType[]) {
    const groupKeys: string[] = [];
    const groupLookup: Record<string, TagFromDb[]> = {};
    for (const t of tagList) {
      const l = initialOf(t.name);
      if (!groupLookup[l]) {
        groupLookup[l] = [];
        groupKeys.push(l);
      }
      groupLookup[l].push(t);
    }
    groupKeys.sort();
    for (const l of groupKeys) {
      groupLookup[l].sort();
    }
    return { keys: groupKeys, lookup: groupLookup };
  }

  function handleUpdateTagCompleted() {
    editModal?.close();
  }
</script>

<svelte:head>
  <title>Tags | Cherry</title>
</svelte:head>
<div class="main">
  {#if loaded}
    {#if grouped?.keys?.length}
      <ul class="group-list">
        {#each grouped.keys as char (char)}
          <li class="group">
            <span class="group-initial">{char.toUpperCase()}</span>
            <ul class="item-list">
              {#each grouped.lookup[char] as tag (tag.id)}
                <li><Tag {tag} {editModal} /></li>
              {/each}
            </ul>
          </li>
        {/each}
      </ul>
    {:else}
      <NoTags />
    {/if}
  {/if}
</div>

<TagEditModal bind:this={editModal} updatecompleted={handleUpdateTagCompleted} />

<style lang="scss">
  .main {
    max-width: 1000px;
    margin: 0 auto;
    padding: 0 15px 15px;
  }
  ul {
    margin: 0;
    padding: 0;
    list-style: none;
    li {
      margin: 6px;
    }
  }
  .item-list {
    display: flex;
    flex-wrap: wrap;
  }
  .group {
    display: flex;
    margin: 10px 0;
  }
  .group-initial {
    margin: 0;
    line-height: 1;
    color: var(--color-text2);
    height: 45px;
    display: flex;
    align-items: center;
    padding: 0 5px;
  }
</style>
