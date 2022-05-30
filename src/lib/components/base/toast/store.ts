import { writable } from 'svelte/store';

import { makeId } from '$lib/utils/common.util';

import type { ToastItem, ToastItemInput } from './type';

export const toasts = writable<ToastItem[]>([]);

const toastDefaultConfig = { duration: 6000, status: 'info' };

export function addToast(opts: ToastItemInput) {
  const id = makeId();
  toasts.update((curr) => {
    const item = { id, ...toastDefaultConfig, ...opts };
    return [...curr, item];
  });
  return id;
}

export function removeToast(id: string | number) {
  toasts.update((curr) => {
    const ret = [];
    for (const item of curr) {
      if (item.id === id) continue;
      ret.push(item);
    }
    return ret;
  });
}
