import { writable } from 'svelte/store';

import { makeId } from '$lib/utils/common.util';

import type { ToastItem, ToastItemInput } from './type';

export const toasts = writable<ToastItem[]>([]);

const toastDefaultConfig = { duration: 6000, status: 'info' };

export function promiseToast<T>(
  p: Promise<T>,
  opts: {
    loading: string;
    success: (data: T) => ToastItemInput;
    error: (err: any) => ToastItemInput;
  },
) {
  const id = addToast({ description: opts.loading, status: 'normal', icon: 'loading', duration: 3600000 });
  p.then(
    (data: T) => {
      const input = opts.success(data);
      updateToast(id, {
        status: 'success',
        duration: 5000,
        ...input,
      });
    },
    (err) => {
      const input = opts.error(err);
      updateToast(id, {
        status: 'error',
        duration: 5000,
        ...input,
      });
    },
  );
  return id;
}

function updateToast(id: string, opts: ToastItemInput) {
  toasts.update((curr) => {
    const ret = [];
    for (const item of curr) {
      if (item.id === id) {
        ret.push({ id, ...toastDefaultConfig, ...opts });
      } else {
        ret.push(item);
      }
    }
    return ret;
  });
}

export function addToast(opts: ToastItemInput) {
  const id = '' + makeId();
  toasts.update((curr) => {
    const item = { id, ...toastDefaultConfig, ...opts };
    return [...curr, item];
  });
  return id;
}

export function removeToast(id: string) {
  toasts.update((curr) => {
    const ret = [];
    for (const item of curr) {
      if (item.id === id) continue;
      ret.push(item);
    }
    return ret;
  });
}
