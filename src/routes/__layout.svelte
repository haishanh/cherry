<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';

  import { isProtected } from '$lib/utils/access.util';

  export const load: Load = async ({ url, session }) => {
    if (isProtected(url)) {
      if (!session || !session.user) {
        return { status: 307, redirect: '/login' };
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
    // --bg-main: #050505;
    --bg-main: #121212;
    --bg-card: #1d1d1f;
    --bg-btn: hsl(223deg 7% 19%);
    --color-btn-bo: hsl(223deg 7% 19%);
    --color-text: #ddd;
    // input
    --color-input-bg: #2d2d30;
    --color-input-bo: #555;
    --color-input-bo-hover: #aaa;
  }
  @mixin light {
    --bg-main: #f3f3f3;
    --bg-card: #fefefe;
    --bg-btn: hsl(0deg 0% 100%);
    --color-btn-bo: hsl(210deg 14% 83%);
    --color-text: #222;
    // input
    --color-input-bg: #f0f0f0;
    --color-input-bo: #dedede;
    --color-input-bo-hover: #aaa;
  }

  :root {
    @media (prefers-color-scheme: dark) {
      @include dark;
      color-scheme: dark;
    }
    @media (prefers-color-scheme: light) {
      @include light;
      color-scheme: light;
    }
    --color-focus-blue: #387cec;
  }

  :global(body, html) {
    margin: 0;
    padding: 0;
  }
  :global(button) {
    user-select: none;
  }
</style>
