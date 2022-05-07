<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';

  export const load: Load = async (input) => {
    const fetch = input.fetch;

    const res = await fetch(`/api/user/token`);
    if (res.ok) {
      return {
        props: await res.json(),
      };
    } else {
      return {
        status: 401,
        error: new Error('page failed to load'),
      };
    }
  };
</script>

<script lang="ts">
  export let token = 'loading';
</script>

<pre>{token}</pre>

<style lang="scss">
</style>
