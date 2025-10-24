<script lang="ts">
  import Button from '$lib/components/base/Button.svelte';
  import { addToast } from '$lib/components/base/toast/store';
  import { request } from '$lib/utils/http.util';
  import type { EventHandler } from 'svelte/elements';

  import type { PageData } from './$types';

  type Props = { data: PageData };
  let { data }: Props = $props();

  async function updateUserSettingsServer(data: { strip_tracking_parameters: boolean }) {
    return await request({ url: '/settings/settings', method: 'POST', data });
  }

  const field = {
    strip_tracking_parameters: data?.user.ff.strip_tracking_parameters,
  };

  const onSubmit: EventHandler<SubmitEvent> = (e) => {
    e.preventDefault();
    updateUserSettingsServer({
      strip_tracking_parameters: field.strip_tracking_parameters,
    }).catch((err) => {
      addToast({ description: 'Something went wrong', status: 'error' });
      console.log('Error', err);
    });
  };
</script>

<section>
  <form onsubmit={onSubmit}>
    <h3>Preference</h3>
    <label>
      <input type="checkbox" name="strip_tracking_parameters" bind:checked={field.strip_tracking_parameters} />
      <span>Strip tracking parameters in URL when saving</span>
    </label>
    <div class="action">
      <Button type="submit">Save</Button>
    </div>
  </form>
</section>

<style lang="scss">
  h3 {
    margin: 12px 0;
  }
  .action {
    margin-top: 15px;
  }
</style>
