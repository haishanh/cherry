<script lang="ts">
  import { Lock, LogOut } from '@lucide/svelte';
  import { onMount } from 'svelte';

  import Button from '$lib/components/base/Button.svelte';
  import ButtonishLink from '$lib/components/base/ButtonishLink.svelte';
  import CopyHide from '$lib/components/base/CopyHide.svelte';

  import type { PageData } from './$types';
  import ChangePasswordModal from './ChangePasswordModal.svelte';

  type Props = {
    data: PageData;
  };
  let { data }: Props = $props();
  const token = data.token;
  const user = data.user;

  let changePasswordModal: ChangePasswordModal;
  const handleClickChangePassword = () => changePasswordModal.open();

  let bookmarkletHref = $state('javascript:void');

  onMount(() => {
    let u = new URL(window.location.href);
    bookmarkletHref =
      'javascript:' +
      `(()=>{ var d=document;function create(d) { var e = d.createElement('div');var c=e.style;
  c.position='fixed';c.padding='15px';c.bottom='15px';c.left='15px';c.fontSize='16px';c.transform='translateY(150%)';c.transition='transform 0.3s ease-out';c.color='#fff';c.borderRadius='8px';c.zIndex='2147483647';
  c.background='rgb(49,129,206)';e.innerText='Picking...';d.body.appendChild(e);
  setTimeout(() => c.transform = 'translateY(0)', 1);
  return e;
}
var e = create(d);
function dismiss(d,e,a,x){
  e.innerText=a?'Cherry Picked!': x && x.message ? x.message:'Something went wrong!';
  e.style.background=a?'rgb(56,161,105)':'rgb(228, 62, 62)';
  setTimeout(() => {e.style.transform='translateY(150%)';setTimeout(()=>d.body.removeChild(e),600);}, 2000);
}
fetch('${u.origin}/api/bookmarklet/v1?url='+encodeURIComponent(window.location.href)+'&pat='+'${token}',{credentials:'omit'}).then(res=> {if(res.ok){dismiss(d,e,1)}else{throw new Error(res.statusText)}}).catch((er)=>dismiss(d,e,0,er))})()`;
  });
</script>

<section>
  <h3>Personal Access Token</h3>
  <CopyHide cnt={token} />
</section>
<section>
  <h3>Bookmarklet</h3>
  <ButtonishLink modifier={['v0']} href={bookmarkletHref}>+ 🍒Cherry</ButtonishLink>
  <p>
    Drag this link to your browser bookmarks bar. Simply click it in your bookmarks bar to save a web page to Cherry.
  </p>
</section>
{#if user.passwordless !== true}
  <section>
    <h3>Password</h3>
    {#snippet icon()}
      <Lock size={18} />
    {/snippet}
    <Button onclick={handleClickChangePassword} {icon}><span>Change password</span></Button>
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
