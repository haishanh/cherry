<script lang="ts">
  import AutocompleteForm from '$lib/components/autocomplte/AutocompleteForm.svelte';
</script>

<main>
  <section>
    <AutocompleteForm />
  </section>
  <section>
    <h1>hello</h1>
  </section>
</main>

<style lang="scss">
  main {
    max-width: 900px;
    margin: 0 auto;
    padding: 15px;
  }

  section {
    margin: 16px 0;

    max-width: 600px;
    margin: 16px auto;
  }
</style>
