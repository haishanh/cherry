<script lang="ts">
  import Cherry from '$lib/components/base/Cherry.svelte';
  import ExternalLink from '$lib/components/base/ExternalLink.svelte';
  /* global __VERSION__:false */
  const version = __VERSION__;
  /* global __COMMIT_SHA__:false */
  const sha = __COMMIT_SHA__;

  const REPO_URL = 'https://github.com/haishanh/cherry';
  const DOCS_URL = 'https://cherry.haishan.me';
</script>

<Cherry />
<p>
  🍒 Cherry version: <code>{version}</code>
  {#if sha}
    <span /><ExternalLink href={REPO_URL + `/tree/${sha}`}><code>{sha}</code></ExternalLink>
  {/if}
</p>
<p>
  <ExternalLink href={DOCS_URL}>Cherry Documents</ExternalLink>
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
