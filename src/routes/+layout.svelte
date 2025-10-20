<svelte:options runes={true} />

<script lang="ts">
  import '@fontsource/inter/latin-400.css';
  import '@fontsource/inter/latin-800.css';
  import '../app.scss';

  import inter400 from '@fontsource/inter/files/inter-latin-400-normal.woff2';
  import inter800 from '@fontsource/inter/files/inter-latin-800-normal.woff2';

  import { afterNavigate, beforeNavigate } from '$app/navigation';
  import ToastList from '$lib/components/base/toast/ToastList.svelte';
  import Header from '$lib/components/feature/Header.svelte';
  import LeafSpinner from '$lib/components/feedback/LeafSpinner.svelte';

  let { children } = $props();

  let isLoading = $state(false);
  let deferShowLoadingTimeout: ReturnType<typeof setTimeout>;
  beforeNavigate((navigation) => {
    if (navigation.to?.url.pathname.startsWith('/api/downloads/')) return;
    if (deferShowLoadingTimeout) {
      clearTimeout(deferShowLoadingTimeout);
    }
    deferShowLoadingTimeout = setTimeout(() => {
      isLoading = true;
    }, 200);
  });
  afterNavigate(() => {
    if (deferShowLoadingTimeout) {
      clearTimeout(deferShowLoadingTimeout);
    }
    isLoading = false;
  });
</script>

<svelte:head>
  <link href={inter400} rel="preload" as="font" crossorigin="" />
  <link href={inter800} rel="preload" as="font" crossorigin="" />
</svelte:head>
<Header />
{@render children()}
<ToastList />
{#if isLoading}
  <div class="loading">
    <LeafSpinner />
  </div>
{/if}

<style lang="scss">
  .loading {
    padding: 30px;
    position: fixed;
    left: 0;
    bottom: 0;
  }
</style>
