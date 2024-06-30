import { derived, writable } from 'svelte/store';

import { sortAlphabetically } from '$lib/utils/common.util';
import { request } from '$lib/utils/http.util';

import { type Backend, coalesceBase, genAuthHeader } from './backend.util';

type Group = { id: number; name: string };
type NewGroup = { name: string };

export const groupList = writable<Group[]>([]);
export const groupListLoaded = writable<boolean>(false);
export const groupListSorted = derived<typeof groupList, Group[]>(groupList, (groupList) => {
  groupList.sort(sortAlphabetically('name'));
  return groupList;
});
export const groupMapById = derived<typeof groupList, Map<number, Group>>(groupList, (list) => {
  const byId = new Map<number, Group>();
  list.forEach((tag) => {
    byId.set(tag.id, tag);
  });
  return byId;
});

export let fetchPromise: Promise<any>;
let initialFetchPromise: Promise<any>;

async function fetchGroups0(opts: { server?: Backend }) {
  const base = coalesceBase(opts?.server);
  const ret = await request({
    url: base + '/api/groups',
    headers: genAuthHeader(opts?.server),
  });
  const groups = ret.data.data as Group[];
  groupList.set(groups);
  groupListLoaded.set(true);
}

export function updateGroupClientSide(d: Group) {
  groupList.update((groups) => {
    for (let i = 0; i < groups.length; i++) {
      if (groups[i].id === d.id) {
        groups[i] = { ...groups[i], ...d };
        break;
      }
    }
    return groups;
  });
}

export function deleteGroupClientSide(d: Group) {
  groupList.update((groups) => {
    const results: Group[] = [];
    for (const group of groups) {
      if (group.id === d.id) continue;
      results.push(group);
    }
    return results;
  });
}

async function createGroupServerSide(d: NewGroup, opts?: { server?: Backend }) {
  const base = coalesceBase(opts?.server);
  const ret = await request({
    url: base + '/api/groups',
    method: 'POST',
    data: d,
    headers: genAuthHeader(opts?.server),
  });
  return ret.data;
}

export async function createGroup(d: NewGroup, opts?: { server: Backend }) {
  const data = await createGroupServerSide(d, opts);
  // data should have a id
  const created = { count: 0, ...d, ...data };
  createGroupClientSide(created);
  return created;
}

function createGroupClientSide(d: Group) {
  groupList.update((groups) => {
    groups.push(d);
    return groups;
  });
}

export async function fetchGroups(opts: { initial?: boolean; server?: Backend } = {}) {
  if (opts.initial) {
    if (!initialFetchPromise) {
      initialFetchPromise = fetchGroups0({ server: opts.server });
      fetchPromise = initialFetchPromise;
    }
    return initialFetchPromise;
  }
  fetchPromise = fetchGroups0({ server: opts.server });
  return fetchPromise;
}
