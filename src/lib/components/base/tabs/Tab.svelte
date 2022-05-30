<script lang="ts">
  export let idx: string | number;
  export let active = false;

  import { actions, get } from './tabs.ctx';

  const ctx = get();
  const store = ctx.store;

  const selectTab = (tab0: HTMLButtonElement) => {
    actions.selectTab(ctx, tab0);
  };

  function handleOnClick(e: MouseEvent) {
    const tab = e.currentTarget as HTMLButtonElement;
    if (tab) {
      e.preventDefault();
      selectTab(tab);
    }
  }

  function register(node: HTMLButtonElement) {
    store.update((s) => {
      s.tabList.push(node);
      return s;
    });
    return {
      destroy: () => {
        store.update((s) => {
          const idx = s.tabList.indexOf(node);
          if (idx >= 0) {
            s.tabList.splice(idx, 1);
          }
          return s;
        });
      },
    };
  }

  let selected = active;
  $: {
    selected = $store.activePanelId ? $store.activePanelId === $store.tabsId + '--panel--' + idx : active;
  }
</script>

<button
  use:register
  class:selected
  on:click={handleOnClick}
  aria-controls="{$store.tabsId}--panel--{idx}"
  aria-selected={selected}
  role="tab"
  data-cherry-tab
  data-orientation="horizontal"
  id="{$store.tabsId}--tab--{idx}"
  type="button"><slot>{$store.tabsId}</slot></button
>

<style lang="scss">
  button {
    appearance: none;
    user-select: none;
    cursor: pointer;
    background: none;
    border: none;
    font-size: unset;
    border-bottom: 2px solid transparent;
    padding: 7px 9px;

    position: relative;
    transform: translateY(1px);
  }
  .selected {
    color: var(--accent);
    border-bottom-color: currentColor;
  }
</style>
