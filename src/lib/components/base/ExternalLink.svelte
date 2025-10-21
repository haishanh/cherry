<script lang="ts">
  import { ExternalLink } from '@lucide/svelte';
  import type { Snippet } from 'svelte';

  interface Props {
    href?: string;
    children?: Snippet;
  }

  let { href = '#', children }: Props = $props();
</script>

<a {href} target="_blank" rel="noopener noreferrer">
  {@render children?.()}
  <i aria-hidden="true">
    <ExternalLink size={16} />
  </i>
</a>

<style lang="scss">
  a {
    color: var(--accent);
    text-decoration: none;
    display: inline-flex;
    align-items: center;
  }
  i {
    display: inline-flex;
    margin-left: 2px;
  }
</style>
