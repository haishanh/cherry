<script lang="ts">
  import Button from '$lib/components/base/Button.svelte';
  import { addToast, promiseToast } from '$lib/components/base/toast/store';
  import ToastList from '$lib/components/base/toast/ToastList.svelte';
  import { sleep } from '$lib/utils/common.util';

  const noop = () => undefined;

  const send = (status = 'info') => {
    addToast({
      description: 'Bookmark deleted.',
      duration: 4000,
      status,
      action: { label: 'UNDO', fn: noop },
    });
  };

  const fakeFetch = async () => {
    await sleep(3000);
    throw new Error('Error');
  };

  function testPromise() {
    promiseToast(fakeFetch(), {
      loading: 'Fetching',
      success: () => ({
        description: 'Success',
        duration: 4000,
      }),
      error: () => ({
        description: 'Error',
        duration: 3000,
      }),
    });
  }
</script>

<main>
  <section>
    <ToastList />
  </section>
  <section>
    <Button onclick={() => send('normal')}>normal</Button>
    <Button onclick={() => send('info')}>info</Button>
    <Button onclick={() => send('success')}>success</Button>
    <Button onclick={() => send('error')}>error</Button>
    <Button onclick={() => send('warning')}>warning</Button>
    <Button onclick={testPromise}>promise</Button>
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
