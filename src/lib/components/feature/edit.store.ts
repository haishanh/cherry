import { writable } from 'svelte/store';

export const currentEditingBookmark = writable({ id: 0, title: '', url: '', desc: '' });
