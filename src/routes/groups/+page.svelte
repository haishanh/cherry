<script lang="ts">
  import type { PageData } from './$types';

  type Props = {
    data: PageData;
  };

  let { data }: Props = $props();
</script>

<svelte:head>
  <title>Groups | Cherry</title>
</svelte:head>

<ul class="groups">
  {#each data.groups as g (g.id)}
    <li></li>
  {/each}
</ul>

<style lang="scss">
</style>
