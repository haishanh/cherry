<script lang="ts">
  import Button from '$lib/components/base/Button.svelte';
  import { addToast } from '$lib/components/base/toast/store';
  import ToastList from '$lib/components/base/toast/ToastList.svelte';

  const noop = () => undefined;

  const send = (status = 'info') => {
    addToast({
      description: 'Bookmark deleted.',
      duration: 400000,
      status,
      action: { label: 'UNDO', fn: noop },
    });
  };
</script>

<main>
  <section>
    <ToastList />
  </section>
  <section>
    <Button on:click={() => send()}>info</Button>
    <Button on:click={() => send('success')}>success</Button>
    <Button on:click={() => send('error')}>error</Button>
    <Button on:click={() => send('warning')}>warning</Button>
  </section>
</main>

<style lang="scss">
  main {
    max-width: 900px;
    margin: 0 auto;
    padding: 15px;
  }

  section {
    margin: 16px 0;
    max-width: 600px;
    margin: 16px auto;
  }
</style>
