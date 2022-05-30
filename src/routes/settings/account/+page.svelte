<script lang="ts">
  import Lock from '@hsjs/svelte-icons/feather/Lock.svelte';
  import LogOut from '@hsjs/svelte-icons/feather/LogOut.svelte';

  import Button from '$lib/components/base/Button.svelte';
  import ButtonishLink from '$lib/components/base/ButtonishLink.svelte';
  import CopyHide from '$lib/components/base/CopyHide.svelte';

  import type { PageData } from './$types';
  import ChangePasswordModal from './ChangePasswordModal.svelte';

  export let data: PageData;
  const token = data.token;
  const user = data.user;

  let changePasswordModal: ChangePasswordModal;

  // <a {id} class="btn-like" href="/api/auth/signout"><LogOut size={20} /><span class="signout-text">Sign out</span></a>
</script>

<section>
  <h3>Personal Access Token</h3>
  <CopyHide cnt={token} />
</section>
{#if user.passwordless !== true}
  <section>
    <h3>Password</h3>
    <Button on:click={() => changePasswordModal.open()}
      ><Lock slot="icon" size={18} /><span>Change password</span></Button
    >
  </section>
{/if}
<section class="signout">
  <h3>Sign Out</h3>
  <p>Signed in as {user.username}</p>
  <ButtonishLink href="/api/auth/signout"><LogOut size={20} /><span class="signout-text">Sign out</span></ButtonishLink>
</section>

<ChangePasswordModal bind:this={changePasswordModal} />

<style lang="scss">
  h3 {
    margin: 12px 0;
  }
  section {
    margin: 25px 0;
    &:first-child {
      margin-top: 0;
    }
  }

  .signout {
    p {
      margin-bottom: 10px;
    }
  }

  .signout-text {
    margin-left: 5px;
  }
</style>
