<script lang="ts">
  import { setContext, type Snippet } from 'svelte';

  import { actions, CONTEXT_KEY, createContext } from './tabs.ctx';

  type Props = {
    tabList: Snippet;
    panels: Snippet;
  };

  let { tabList, panels }: Props = $props();

  const ctx = createContext();
  setContext(CONTEXT_KEY, ctx);
  const store = ctx.store;

  const selectTab = (tab0: HTMLButtonElement) => {
    actions.selectTab(ctx, tab0);
  };

  function getActiveTab() {
    const current = document.activeElement as HTMLButtonElement;
    const tabList = $store.tabList;
    const idx = tabList.indexOf(current);
    return { idx, tab: tabList[idx] };
  }

  function handleArrowLeftKeyDown(event: KeyboardEvent) {
    // focus prev tab if necessary
    const tabList = $store.tabList;
    const { idx } = getActiveTab();
    if (idx >= 0) {
      let n = (idx - 1 + tabList.length) % tabList.length;
      const item = tabList[n];
      if (item) {
        selectTab(item);
        event.preventDefault();
      }
    }
  }

  function handleArrowRightKeyDown(event: KeyboardEvent) {
    // focus next tab if necessary
    const tabList = $store.tabList;
    const { idx } = getActiveTab();
    if (idx >= 0) {
      let n = (idx + 1) % tabList.length;
      const tab0 = tabList[n];
      if (tab0) {
        event.preventDefault();
        selectTab(tab0);
      }
    }
  }

  function handleTabKeyDown(event: KeyboardEvent) {
    const current = document.activeElement as HTMLButtonElement;
    const tabList = $store.tabList;
    const idx = tabList.indexOf(current);
    if (idx < 0) return;
    const tab = tabList[idx];
    if (!tab) {
      console.log('handleTabKeyDown unexpected error1 (ignored)');
      return;
    }
    const panelId = tab.getAttribute('aria-controls');
    if (!panelId) {
      console.log('handleTabKeyDown unexpected error2 (ignored)');
      return;
    }
    for (const panel of $store.panelList) {
      if (panel.id === panelId) {
        event.preventDefault();
        panel?.focus();
        break;
      }
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'Tab':
        handleTabKeyDown(event);
        break;
      case 'ArrowRight':
        handleArrowRightKeyDown(event);
        break;
      case 'ArrowLeft':
        handleArrowLeftKeyDown(event);
        break;
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />
<div role="tablist" aria-orientation="horizontal" data-cherry-tab-list>
  <div class="tablist-wrap">
    {@render tabList()}
  </div>
</div>
<div data-cherry-tab-panels>
  {@render panels()}
</div>

<style lang="scss">
  [data-cherry-tab-list] {
    display: flex;
  }
  .tablist-wrap {
    display: flex;
    flex-wrap: wrap;
    border-bottom: 1px solid var(--color-text2);
  }
</style>
