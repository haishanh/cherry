<script lang="ts">
  import ButtonishLink from '$lib/components/base/ButtonishLink.svelte';
  import UserSignForm from '$lib/components/feature/UserSignForm.svelte';

  import type { PageData } from './$types';

  type Props = {
    data: PageData;
  };
  let { data }: Props = $props();
</script>

<svelte:head>
  <title>Sign In | Cherry</title>
</svelte:head>
<h1>Sign in</h1>
<UserSignForm kind="signin" />

{#if data.googleOauthEnabled || data.registration}
  <div class="divider"><span>OR</span></div>
{/if}

{#if data.googleOauthEnabled}
  <section>
    <ButtonishLink href="/api/auth/google">Sign in with Google</ButtonishLink>
  </section>
{/if}

{#if data.registration}
  <section class="signup">
    <a href="/signup">Sign up now</a>
  </section>
{/if}

<style lang="scss">
  h1 {
    margin-top: 0;
  }

  .divider {
    margin: 15px auto;
    text-align: center;
    font-style: italic;
    color: var(--color-text2);
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    &:before,
    &:after {
      content: '';
      top: 50%;
      transform: translateY(-50%);
      width: 45%;
      max-width: 100px;
      height: 1px;
      background-color: currentColor;
    }
  }

  section {
    margin: 16px 0;
  }
  .signup {
    margin-top: 26px;
    margin-bottom: 6px;
  }
</style>
