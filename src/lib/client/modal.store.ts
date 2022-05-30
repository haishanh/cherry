import { writable } from 'svelte/store';

import type GroupAddModal from '$lib/components/home/GroupAddModal.svelte';
import type GroupDeleteConfirmModal from '$lib/components/home/GroupDeleteConfirmModal.svelte';
import type GroupListModal from '$lib/components/home/GroupListModal.svelte';

export const groupAddModal = writable<GroupAddModal>();
export const groupListModal = writable<GroupListModal>();
export const groupSelectModal = writable<GroupListModal>();
export const groupDeleteConfirmModal = writable<GroupDeleteConfirmModal>();
