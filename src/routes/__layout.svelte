<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';

  export const load: Load = async ({ url, session }) => {
    if (url.pathname !== '/login') {
      if (!session || !session.user) {
        return {
          status: 307,
          redirect: '/login',
        };
      }
    }

    return {};
  };
</script>

<script lang="ts">
  import '../app.scss';
</script>

<svelte:head>
  <title>Cherry</title>
</svelte:head>

<slot />

<style lang="scss">
  @font-face {
    font-family: 'Inter';
    font-style: normal;
    font-weight: 400;
    font-display: swap;
    // prettier-ignore
    src: local('Inter-Regular'), url('../assets/interJD5f6rvu.woff2') format('woff2'), url('../assets/interJD5f6rvu.woff') format('woff');
  }
  @font-face {
    font-family: 'Inter';
    font-style: normal;
    font-weight: 800;
    font-display: swap;
    // prettier-ignore
    src: local('Inter-ExtraBold'), url('../assets/interIoAYgYqv.woff2') format('woff2'), url('../assets/interIoAYgYqv.woff') format('woff');
  }

  @mixin dark {
    --bg-main: #050505;
    --bg-card: #1d1d1f;
    --color-text: #ddd;
  }
  @mixin light {
    --bg-main: #f3f3f3;
    --bg-card: #fefefe;
    --color-text: #222;
  }

  :global(:root) {
    @media (prefers-color-scheme: dark) {
      @include dark;
      color-scheme: dark;
    }
    @media (prefers-color-scheme: light) {
      @include light;
      color-scheme: light;
    }
  }

  :global(body, html) {
    margin: 0;
    padding: 0;
  }
  :global(button) {
    user-select: none;
  }
</style>
