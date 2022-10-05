<script lang="ts">
  import Cherry from '$lib/components/base/Cherry.svelte';
  /* global __VERSION__:false */
  const version = __VERSION__;
  /* global __COMMIT_SHA__:false */
  const sha = __COMMIT_SHA__;
</script>

<Cherry />
<p>
  Cherry version: <code>{version}</code>
  {#if sha}
    <span /><code>{sha}</code>
  {/if}
</p>

<style>
  code {
    font-family: var(--fmono);
    padding: 2px 4px;
    background-color: var(--bg-v2);
    border-radius: 5px;
    font-size: 0.9em;
  }
</style>
