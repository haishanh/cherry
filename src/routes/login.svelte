<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';
  export const load: Load = async (input) => {
    const fetch = input.fetch;
    const res = await fetch('/api/server/settings');
    if (res.ok) {
      const config = await res.json();
      return {
        props: {
          registration: config.registration,
        },
      };
    }
    return {
      props: {
        registration: false,
      },
    };
  };
</script>

<script lang="ts">
  export let registration = false;
</script>

<main>
  <h1>Login</h1>
  <section>
    <a href="/api/auth/google">Log in with Google</a>
  </section>

  {#if registration}
    <section>
      Or <a href="/join">register</a>
    </section>
  {/if}
</main>

<style lang="scss">
  main {
    max-width: 900px;
    margin: 0 auto;
    padding: 15px;
  }

  section {
    margin: 16px 0;
  }
</style>
