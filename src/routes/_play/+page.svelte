<script lang="ts">
  let pages = ['Button', 'Pagination', 'TagAutocomplete', 'Toast', 'SearchForm', 'Form', 'Import', 'Modal'];
</script>

<svelte:head>
  <title>Style | Cherry</title>
</svelte:head>
<main>
  <ul>
    {#each pages as p (p)}
      <li><a href="/_play/{p}">{p}</a></li>
    {/each}
  </ul>
</main>

<style lang="scss">
  main {
    max-width: 900px;
    margin: 0 auto;
    padding: 15px;
  }
  ul li {
    padding: 5px 0;
  }
  ul li a {
    text-decoration: none;
    color: inherit;
  }
</style>
