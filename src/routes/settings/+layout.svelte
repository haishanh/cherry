<script lang="ts">
  import type { LayoutData } from './$types';
  import SideBar from './SideBar.svelte';

  export let data: LayoutData;
</script>

<svelte:head>
  <title>Settings | Cherry</title>
</svelte:head>
<div class="root">
  <SideBar pathname={data.pathname} user={data.user} />
  <main><slot /></main>
</div>

<style lang="scss">
  .root {
    max-width: 1000px;
    margin: 0 auto;
    padding: 0 15px 15px;
    @media (min-width: 768px) {
      display: grid;
      grid-template-columns: max-content minmax(100px, 1fr);
      gap: 22px;
    }
  }
</style>
