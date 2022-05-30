import { derived, writable } from 'svelte/store';

import { request } from '$lib/utils/http.util';

import { type Backend, coalesceBase, genAuthHeader } from './backend.util';

type Tag = { id: number; name: string };

export const tagList = writable<Tag[]>([]);
export const tagListLoaded = writable<boolean>(false);

export const tagMapById = derived<typeof tagList, Map<number, Tag>>(tagList, (tagList) => {
  const byId = new Map<number, Tag>();
  tagList.forEach((tag) => {
    byId.set(tag.id, tag);
  });
  return byId;
});
export const tagMapByName = derived<typeof tagList, Map<string, Tag>>(tagList, (tagList) => {
  const byName = new Map<string, Tag>();
  tagList.forEach((tag) => {
    byName.set(tag.name, tag);
  });
  return byName;
});

let fetchInitial = false;
export async function fetchTags(opts: { initial?: boolean; server?: Backend } = {}) {
  if (opts.initial) {
    if (fetchInitial) {
      return;
    } else {
      fetchInitial = true;
    }
  }
  const base = coalesceBase(opts?.server);
  const ret = await request({ url: base + '/api/tags', headers: genAuthHeader(opts?.server) });
  const tags = ret.data.data as Tag[];
  tagList.set(tags);
  tagListLoaded.set(true);
}

export function updateTagClientSide(t: Tag) {
  tagList.update((tags) => {
    for (const tag of tags) {
      if (tag.id === t.id) {
        Object.keys(t).forEach((k) => (tag[k] = t[k]));
      }
    }
    return tags;
  });
}

export function addTagsClientSide(tags0: Tag[]) {
  const lookup = new Map<number, Tag>();
  for (const t of tags0) lookup.set(t.id, t);
  tagList.update((tags) => {
    for (let i = 0; i < tags.length; i++) {
      const t = lookup.get(tags[i].id);
      if (t && t.id) {
        tags[i] = t;
        lookup.delete(t.id);
      }
    }
    for (const [_, t] of lookup) tags.push(t);
    return tags;
  });
}

export function deleteTagClientSide(t: Tag) {
  tagList.update((tags) => {
    const ret = [];
    for (const tag of tags) {
      if (tag.id === t.id) continue;
      ret.push(tag);
    }
    return ret;
  });
}
