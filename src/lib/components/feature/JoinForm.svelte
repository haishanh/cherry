<script lang="ts">
  import { goto } from '$app/navigation';
  import Button from '$lib/components/base/Button.svelte';
  import Field from '$lib/components/base/Field.svelte';
  import { request } from '$lib/utils/http.util';

  async function join(opts: { email: string }) {
    await request({ url: '/api/auth/join', method: 'POST', data: opts });
  }

  let email = '';

  function onSubmit() {
    if (email) {
      join({ email }).then(() => goto('/'));
    }
  }
</script>

<form on:submit|preventDefault={onSubmit}>
  <Field name="Email" bind:value={email} />
  <Button type="submit">Join</Button>
</form>

<style lang="scss">
  form {
    :global(button) {
      margin-top: 20px;
    }
  }
</style>
