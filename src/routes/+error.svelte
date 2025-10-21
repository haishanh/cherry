<script lang="ts">
  import { page } from '$app/state';
  import Cherry from '$lib/components/base/Cherry.svelte';
  const status = page.status;
  const error = page.error;
</script>

<main>
  <div>
    <Cherry size={160} />
  </div>
  <h1>{status}</h1>
  <h2>{error?.message}</h2>
  {#if status >= 500}
    <p>You may find a bug!</p>
  {:else if status === 401}
    <p>You are not allowed!</p>
  {:else}
    <p>Sorry</p>
  {/if}
  {#if error?.stack}
    <details>
      <summary>Details for nerds</summary>
      <p>Wanna file a bug?</p>
      <pre>{error?.stack}</pre>
    </details>
  {/if}
</main>

<style lang="scss">
  main {
    max-width: 900px;
    margin: 0 auto;
    padding: 15px;
  }
  pre {
    overflow: auto;
    padding: 15px 0;
  }
</style>
