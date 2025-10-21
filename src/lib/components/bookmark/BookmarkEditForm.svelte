<script lang="ts" module>
  export enum Event0Type {
    UpdateStart,
    UpdateFailed,
    UpdateCompleted,
    CreateCompleted,
  }

  export type Event0 =
    | {
        type: Event0Type.UpdateStart;
        payload: {
          url: string;
          title: string;
          desc: string;
          // tags:
        };
      }
    | {
        type: Event0Type.CreateCompleted | Event0Type.UpdateCompleted;
        payload: BookmarkFromDb;
      }
    | {
        type: Event0Type.UpdateFailed;
        payload: {
          bookmark: {
            url: string;
          };
          error: any;
        };
      };
</script>

<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import invariant from 'tiny-invariant';

  import { coalesceBase, genAuthHeader } from '$lib/client/backend.util';
  import { commonRule, validate } from '$lib/client/form.util';
  import { createGroup, fetchGroups, groupListLoaded, groupListSorted, groupMapById } from '$lib/client/group.store';
  import { addTagsClientSide, fetchTags, tagList, tagListLoaded, tagMapById } from '$lib/client/tag.store';
  import Button from '$lib/components/base/Button.svelte';
  import Field from '$lib/components/base/Field.svelte';
  import FieldGroup from '$lib/components/base/FieldGroup.svelte';
  import FieldTag from '$lib/components/base/FieldTag.svelte';
  import type { BookmarkFromDb, TagFromDb, TagType } from '$lib/type';
  import { request } from '$lib/utils/http.util';

  type Group = { id: number; name: string };
  type BookmarkRaw = Omit<BookmarkFromDb, 'id'> & {
    // tags?: TagType[];
    // id is absent if we are creating a new bookmark here
    id?: number;
  };
  type BookmarkHydrated = BookmarkRaw & { tags?: TagType[]; group?: Group };

  type Props = {
    onev0: (x: Event0) => void;
    bookmark: BookmarkRaw;
    // this mainly for the browser ext
    server?: { apiBase: string; pat: string };
  };
  let { onev0, bookmark, server = { apiBase: '', pat: '' } }: Props = $props();

  let tags: TagType[] = $state([]);
  let group: Group | null = $state(null);

  const ourApi = {
    fetchTagsByTagIds: async (tagIds: number[]) => {
      const base = coalesceBase(server);
      const url = base + '/api/tags/' + tagIds.join(',');
      const { data } = await request({ url, headers: genAuthHeader(server) });
      return data && data.items;
    },
  };

  function logError(e: any) {
    console.log('Error', e);
  }

  onMount(() => {
    fetchTags({ initial: true, server }).catch(logError);
    fetchGroups({ initial: true, server }).catch(logError);
  });

  function hydrateTags() {
    const tagIds = bookmark.tagIds;
    // const tagMapById
    if ($tagListLoaded && tagIds && tagIds.length > 0 && typeof tagIds[0] === 'number') {
      const byId = $tagMapById;
      tags = tagIds.map((id) => byId.get(id)).filter((t) => !!t) as TagType[];
    }
  }

  function hydrateGroup() {
    const groupId = bookmark.groupId;
    if (typeof groupId === 'number') {
      const byId = $groupMapById;
      const g = byId.get(groupId);
      if (g) group = g;
    }
  }

  $effect(() => {
    if ($tagListLoaded) untrack(() => hydrateTags());
  });
  $effect(() => {
    if ($groupListLoaded) untrack(hydrateGroup);
  });

  onMount(() => {
    if ($tagListLoaded) hydrateTags();
    if ($groupListLoaded) hydrateGroup();
  });

  async function updateOrCreateBookmark(b: Omit<BookmarkHydrated, 'tagIds' | 'groupId' | 'createdAt' | 'updatedAt'>) {
    if (b.group) {
      invariant(b.group.name);
      if (!b.group.id) {
        const g = await createGroup(b.group, { server });
        // overwrite in place
        b.group = g;
      }
    }
    const id = b.id;
    let config: Parameters<typeof request>[0];
    const base = coalesceBase(server);
    const headers = genAuthHeader(server);
    if (id) {
      config = { url: base + '/api/bookmarks/' + id, method: 'PATCH', data: b, headers };
    } else {
      config = { url: base + '/api/bookmarks', method: 'POST', data: b, headers };
    }
    let ret = await request(config);
    return ret.data;
  }

  const rule = {
    url: [commonRule.url],
  };
  let error = $state({ url: '' });

  async function updateTagStore(tagIds: number[]) {
    if (!tagIds || tagIds.length === 0) return;
    const tags0: TagFromDb[] = await ourApi.fetchTagsByTagIds(tagIds);
    addTagsClientSide(tags0);
  }

  async function onSubmit(e: Event) {
    e.preventDefault();
    const result = validate(rule, { url: bookmark.url });
    if (result.error) {
      // @ts-ignore
      error = result.error;
      return;
    }
    // make a copy
    const b: BookmarkHydrated = {
      ...bookmark,
      ...result.value,
      // checking $tagListLoaded here, since we need to make sure tags have been loaded
      // or we may accidentally remove/replace all tags of this bookmark
      ...($tagListLoaded ? { tags } : undefined),
      // group can be null here
      // the backend should delete the `groupId` column in this case
      ...($groupListLoaded && group ? { group } : undefined),
    };

    delete b.groupId;
    delete b.tagIds;
    delete b.createdAt;
    delete b.updatedAt;

    let id0 = b.id;
    onev0({ type: Event0Type.UpdateStart, payload: b });
    try {
      // ret is a bookmark
      const ret = await updateOrCreateBookmark(b);
      if (!id0) {
        invariant(ret.id, 'updateOrCreateBookmark should resolve to an object with prop id');
        onev0({ type: Event0Type.CreateCompleted, payload: ret });
      } else {
        onev0({ type: Event0Type.UpdateCompleted, payload: ret });
      }
      if (ret.tagIds) {
        updateTagStore(ret.tagIds).catch((e) => console.log('updateTagStore failed', e));
      }
    } catch (err) {
      onev0({ type: Event0Type.UpdateFailed, payload: { bookmark: b, error: err } });
      console.log('Update bookmark failed', err);
    }
  }
</script>

<form onsubmit={onSubmit}>
  <Field name="Link" type="url" placeholder="https://example.com" bind:value={bookmark.url} error={error.url} />
  <FieldTag options={$tagList} bind:tags />
  <FieldGroup options={$groupListSorted} bind:group />
  <Field name="Title" placeholder="" bind:value={bookmark.title} />
  <Field name="Description" bind:value={bookmark.desc} type="textarea" placeholder="" />
  <div class="action">
    <Button type="submit">
      <span>Save</span>
    </Button>
  </div>
</form>

<style lang="scss">
  .action {
    margin-top: 15px;
  }
</style>
