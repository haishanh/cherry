<script lang="ts">
  import ImportFromX from './ImportFromX.svelte';
  const accept = ['text/html'];
</script>

<p>
  Go to <a href="https://getpocket.com/export" target="_blank" rel="noopener noreferrer">Pocket Export page</a>, click
  "Export HTML file", upload the html file here.
</p>
<ImportFromX source="pocket" {accept} />

<style lang="scss">
  a {
    text-decoration: none;
    color: var(--accent);
  }
</style>
