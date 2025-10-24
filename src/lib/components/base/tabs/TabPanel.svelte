<script lang="ts">
  import type { Snippet } from 'svelte';

  type Props = {
    idx: string | number;
    active?: boolean;
    children: Snippet;
  };
  let { idx, active = false, children }: Props = $props();

  import { get } from './tabs.ctx';

  const ctx = get();
  const store = ctx.store;

  function register(node: HTMLDivElement) {
    // ctx.tabCount = ctx.tabCount + 1;
    // tabIdx = ctx.tabCount;

    store.update((s) => {
      s.panelList.push(node);
      return s;
    });
    return {
      destroy: () => {
        store.update((s) => {
          const idx = s.panelList.indexOf(node);
          if (idx >= 0) {
            s.panelList.splice(idx, 1);
          }
          return s;
        });
      },
    };
  }

  let hidden = $derived($store.activePanelId ? $store.activePanelId !== $store.tabsId + '--panel--' + idx : !active);
</script>

<div
  use:register
  aria-labelledby="{$store.tabsId}--tab--{idx}"
  role="tabpanel"
  tabindex="-1"
  data-reach-tab-panel
  id="{$store.tabsId}--panel--{idx}"
  {hidden}
>
  {@render children()}
</div>

<style lang="scss">
  [hidden] {
    display: none;
  }
</style>
