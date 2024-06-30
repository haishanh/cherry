import { getContext } from 'svelte';
import { type Writable, writable } from 'svelte/store';

let id = 1;
export function makeId() {
  return id++;
}

export const CONTEXT_KEY = 'cherry-tabs';
export type StoreValueType = {
  tabsId: string;
  tabList: HTMLButtonElement[];
  panelList: HTMLDivElement[];
  activePanelId: string;
};

export type StoreType = Writable<StoreValueType>;

export type ContextType = {
  store: StoreType;
  tabCount: number;
  panelCount: number;
};

export function createStore() {
  return writable<StoreValueType>({
    tabsId: 'tabs--' + makeId(),
    tabList: [],
    panelList: [],
    activePanelId: '',
  });
}

export function createContext() {
  return {
    store: createStore(),
    tabCount: 0,
    panelCount: 0,
  };
}

export function get() {
  return getContext<ContextType>(CONTEXT_KEY);
}

export const actions = {
  selectTab: (ctx: ContextType, tab0: HTMLButtonElement) => {
    tab0.focus();
    const id = tab0.getAttribute('aria-controls');
    if (!id) return;
    const store = ctx.store;
    store.update((s) => {
      s.activePanelId = id;
      return s;
    });
  },
};
