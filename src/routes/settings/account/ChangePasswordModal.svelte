<script lang="ts">
  export const open = () => {
    resetError();
    modal.open();
  };
  export const close = () => {
    modal.close();
  };

  import { Save } from '@lucide/svelte';
  import { beforeNavigate } from '$app/navigation';
  import Button from '$lib/components/base/Button.svelte';
  import Field from '$lib/components/base/Field.svelte';
  import Modal from '$lib/components/base/Modal.svelte';
  import { addToast } from '$lib/components/base/toast/store';
  import { request, RequestError } from '$lib/utils/http.util';

  let modal: Modal;
  beforeNavigate(() => {
    close();
  });

  let currentPassword = $state('');
  let newPassword1 = $state('');
  let newPassword2 = $state('');

  let error = $state({ currentPassword: '', newPassword1: '', newPassword2: '' });
  function resetError() {
    currentPassword = '';
    newPassword1 = '';
    newPassword2 = '';
    error = {
      currentPassword: '',
      newPassword1: '',
      newPassword2: '',
    };
  }
  async function updatePassword(input: { currentPassword: string; newPassword: string }) {
    return await request({
      url: '/api/user/v1',
      method: 'POST',
      data: {
        op: 'changePassword',
        data: { currentPassword: input.currentPassword, newPassword: input.newPassword },
      },
    });
  }
  async function onSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (newPassword1 !== newPassword2) {
      error.newPassword2 = 'New password miss match';
      return;
    }
    try {
      await updatePassword({ currentPassword, newPassword: newPassword1 });
      close();
      addToast({ description: 'Password changed', status: 'success' });
    } catch (err) {
      if (err instanceof RequestError && err.body?.code === 'InvalidPassword') {
        error.currentPassword = 'Invalid password';
        return;
      }
      addToast({ description: 'Something went wrong', status: 'error' });
      throw err;
    }
  }
</script>

<Modal bind:this={modal}>
  <h2>Change your password</h2>
  <form onsubmit={onSubmit}>
    <Field
      name="currentPassword"
      label="Current passowrd"
      type="password"
      placeholder=""
      bind:value={currentPassword}
      error={error.currentPassword}
    />
    <Field
      name="newPassword1"
      label="New password"
      type="password"
      placeholder=""
      bind:value={newPassword1}
      error={error.newPassword1}
    />
    <Field
      name="newPassword2"
      label="Confirm new password"
      type="password"
      placeholder=""
      bind:value={newPassword2}
      error={error.newPassword2}
    />
    <div class="action">
      {#snippet icon()}
        <Save size={16} />
      {/snippet}

      <Button type="submit" {icon}>
        <span>Save</span>
      </Button>
    </div>
  </form>
</Modal>

<style lang="scss">
  .action {
    margin-top: 15px;
  }
</style>
