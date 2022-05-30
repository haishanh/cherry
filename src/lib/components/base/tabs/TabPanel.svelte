<script lang="ts">
  export let idx: string | number;
  export let active = false;

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

  let hidden = !active;
  $: {
    hidden = $store.activePanelId ? $store.activePanelId !== $store.tabsId + '--panel--' + idx : !active;
  }
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
  <slot />
</div>

<style lang="scss">
  [hidden] {
    display: none;
  }
</style>
