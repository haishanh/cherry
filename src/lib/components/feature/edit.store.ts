import { writable } from 'svelte/store';

export const currentEditingBookmark = writable({ title: '', url: '', desc: '' });
