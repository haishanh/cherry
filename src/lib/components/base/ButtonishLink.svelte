<script lang="ts">
  import type { Snippet } from 'svelte';

  type Modifier = 'v0';

  type Props = {
    href: string;
    modifier?: Modifier[];
    children?: Snippet;
  };

  let { children, href, modifier }: Props = $props();
</script>

<a class={modifier ? modifier.join(' ') : ''} {href}>{@render children?.()}</a>

<style lang="scss">
  a {
    --fg: var(--color-text);
    --bg: var(--bg-btn);

    padding: 10px 14px;
    border-radius: 200px;
    text-decoration: none;
    cursor: pointer;
    user-select: none;
    display: inline-flex;
    align-items: center;

    color: var(--fg);
    background-color: var(--bg);
    border: 1px solid var(--color-btn-bo);
    border-color: hsl(0deg 0% var(--bo-lightness));

    @media (prefers-color-scheme: dark) {
      --bo-lightness: 30%;
      --bo-lightness-hover: 70%;
      --bg-hover: hsl(0deg 0% 19%);
    }
    @media (prefers-color-scheme: light) {
      --bo-lightness: 80%;
      --bo-lightness-hover: 15%;
      --bg-hover: hsl(0deg 0% 90%);
    }
    &:hover {
      border-color: hsl(0deg 0% var(--bo-lightness-hover));
      background-color: var(--bg-hover);
    }

    &.v0 {
      border-style: dashed;
      border-width: 2px;
    }
  }
</style>
