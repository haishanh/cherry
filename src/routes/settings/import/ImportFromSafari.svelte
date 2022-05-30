<script lang="ts">
  import ImportFromX from './ImportFromX.svelte';
  const accept = ['text/html'];
</script>

<p>
  Check <a
    href="https://www.ionos.com/digitalguide/websites/web-development/export-safari-bookmarks/"
    target="_blank"
    rel="noopener noreferrer">this article</a
  > on exporting bookmarks from Safari, upload the exported html file here.
</p>
<ImportFromX source="safari" {accept} />

<style lang="scss">
  a {
    text-decoration: none;
    color: var(--accent);
  }
</style>
