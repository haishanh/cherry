<script lang="ts">
  import ImportFromX from './ImportFromX.svelte';
  const accept = ['.csv'];
</script>

<p>
  Check <a href="https://help.raindrop.io/import#csv" target="_blank" rel="noopener noreferrer">this article</a> on how to
  prepare the CSV file, upload the CSV file here when ready.
</p>
<ImportFromX source="csv" {accept} />

<style lang="scss">
  a {
    text-decoration: none;
    color: var(--accent);
  }
</style>
