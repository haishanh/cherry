<script lang="ts">
  import Cherry from '$lib/components/base/Cherry.svelte';
  /* global __VERSION__:false */
  const version = __VERSION__;
</script>

<Cherry />

<p>Cherry is a self-hostable bookmark app</p>
<p>Cherry version: <code>{version}</code></p>

<style>
  code {
    font-family: var(--fmono);
    padding: 2px 4px;
    background-color: var(--bg-v2);
    border-radius: 5px;
    font-size: 0.9em;
  }
</style>
