<script lang="ts">
  import Home from '$lib/components/Home.svelte';
  import type { PageData } from './$types';

  type Props = {
    data: PageData;
  };

  let { data }: Props = $props();
</script>

<svelte:head>
  <title>Cherry</title>
</svelte:head>
<Home {...data} />
