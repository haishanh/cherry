<script lang="ts">
  import ImportFromX from './ImportFromX.svelte';
  const accept = ['text/html'];
</script>

<p>
  Check <a href="https://www.wikihow.com/Export-Bookmarks-from-Chrome" target="_blank" rel="noopener noreferrer"
    >this article</a
  > on exporting bookmarks from Chrome, upload the exported html file here.
</p>
<ImportFromX source="chrome" {accept} />

<style lang="scss">
  a {
    text-decoration: none;
    color: var(--accent);
  }
</style>
