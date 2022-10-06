<script lang="ts">
  import ExternalLink from '@hsjs/svelte-icons/feather/ExternalLink.svelte';

  export let href = '#';
</script>

<a {href} target="_blank" rel="noopener noreferrer">
  <slot />
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
