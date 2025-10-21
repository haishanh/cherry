<script lang="ts">
  import type { Snippet } from 'svelte';

  type Modifier = 'success' | 'warning' | 'info' | 'error';
  type Props = { modifier: Modifier; children: Snippet };
  let { modifier, children }: Props = $props();
</script>

<span class="chip {modifier}">{@render children()}</span>

<style lang="scss">
  .chip {
    padding: 4px 9px;
    border-radius: 100px;
    color: var(--text);
    border: 1px solid var(--border);
    background-color: var(--bg);
  }
  @media (prefers-color-scheme: light) {
    .info {
      --bg: hsl(208, 100%, 97%);
      --border: hsl(221, 91%, 91%);
      --text: hsl(210, 92%, 45%);
    }
    .success {
      --bg: hsl(143, 85%, 96%);
      --border: hsl(145, 92%, 91%);
      --text: hsl(140, 100%, 27%);
    }
    .error {
      --bg: hsl(359, 100%, 97%);
      --border: hsl(359, 100%, 94%);
      --text: hsl(360, 100%, 45%);
    }
    .warning {
      --bg: hsl(49, 100%, 97%);
      --border: hsl(49, 91%, 91%);
      --text: hsl(31, 92%, 45%);
    }
  }
  @media (prefers-color-scheme: dark) {
    .info {
      --bg: hsl(215, 100%, 6%);
      --border: hsl(223, 100%, 12%);
      --text: hsl(216, 87%, 65%);
    }
    .success {
      --bg: hsl(150, 100%, 6%);
      --border: hsl(147, 100%, 12%);
      --text: hsl(150, 86%, 65%);
    }
    .error {
      --bg: hsl(358, 76%, 10%);
      --border: hsl(357, 89%, 16%);
      --text: hsl(358, 100%, 81%);
    }
    .warning {
      --bg: hsl(64, 100%, 6%);
      --border: hsl(60, 100%, 12%);
      --text: hsl(46, 87%, 65%);
    }
  }
</style>
