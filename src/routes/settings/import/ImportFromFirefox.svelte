<script lang="ts">
  import ImportFromX from './ImportFromX.svelte';
  const accept = ['text/html'];
</script>

<p>
  Check <a
    href="https://support.mozilla.org/en-US/kb/export-firefox-bookmarks-to-backup-or-transfer"
    target="_blank"
    rel="noopener noreferrer">this article</a
  > on exporting bookmarks from Firefox, upload the exported html file here.
</p>
<ImportFromX source="firefox" {accept} />

<style lang="scss">
  a {
    text-decoration: none;
    color: var(--accent);
  }
</style>
