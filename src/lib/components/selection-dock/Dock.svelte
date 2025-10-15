<script lang="ts">
  import { fly } from 'svelte/transition';

  import DockContent, { type DockOperation } from './DockContent.svelte';

  type Props = {
    ondock: (event: { op: DockOperation }) => void;
    count?: number;
  };

  let { ondock, count = 0 }: Props = $props();
</script>

<div class="dock" transition:fly={{ y: 50 }}>
  <DockContent {count} {ondock} />
</div>

<style lang="scss">
  .dock {
    --shadow-color: 0deg 0% 60%;
    // prettier-ignore
    --shadow1:
      0px 0.5px 0.6px hsl(var(--shadow-color) / 0.36),
      0px 1.5px 1.7px -0.8px hsl(var(--shadow-color) / 0.36),
      0px 3.8px 4.3px -1.7px hsl(var(--shadow-color) / 0.36),
      0px 9.3px 10.5px -2.5px hsl(var(--shadow-color) / 0.36);
    position: fixed;
    left: 50%;
    transform: translateX(-50%);
    bottom: 30px;
    max-width: 90vw;
    width: 600px;
    padding: 15px 22px;
    border-radius: 10px;
    background-color: var(--bg);
    color: var(--fg);
    @media (prefers-color-scheme: light) {
      box-shadow: var(--shadow1);
      border: 1px solid hsl(0deg 0% 96%);
    }
    @media (prefers-color-scheme: dark) {
      border: 1px solid hsl(0deg 0% 26%);
    }
    @media (prefers-color-scheme: dark) {
      // --bg: hsl(0deg 0% 84%);
      // --fg: hsl(0deg 0% 13%);
      --bg: hsl(0deg 0% 18%);
      --fg: hsl(0deg 0% 95%);
    }
    @media (prefers-color-scheme: light) {
      // --bg: #000;
      // --fg: #eee;
      --bg: hsl(0deg 0% 99%);
      --fg: hsl(0deg 0% 13%);
    }
  }
</style>
