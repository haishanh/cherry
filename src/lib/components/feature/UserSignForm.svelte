<script lang="ts">
  type Props = {
    kind: 'signup' | 'signin';
  };

  let { kind }: Props = $props();

  import { goto } from '$app/navigation';
  import { commonRule, validate } from '$lib/client/form.util';
  import Button from '$lib/components/base/Button.svelte';
  import Field from '$lib/components/base/Field.svelte';
  import { request, RequestError } from '$lib/utils/http.util';
  import type { FormEventHandler } from 'svelte/elements';

  async function join(opts: { username: string; password: string }) {
    return await request({ url: '/api/auth/signup', method: 'POST', data: opts });
  }
  async function signin(opts: { username: string; password: string }) {
    return await request({ url: '/api/auth/signin', method: 'POST', data: opts });
  }

  const passwordRule = {
    // super loosy ¯\_(ツ)_/¯
    validate: (s: string) => s.length > 0,
    msg: 'Password is too short',
  };

  const rule = {
    username: [commonRule.email],
    password: [passwordRule],
  };
  let error: Partial<{ username: string; password: string }> = $state({});

  let username = $state('');
  let password = $state('');

  function onSuccessSignin(_ret: { res: Response }) {
    // console.log('onSuccessSignin', ret.res?.redirected)
    goto('/').catch((err) => {
      console.log('goto failed', err);
    });
  }

  const onSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const valueBeforeValidation = { username, password };
    const result = validate(rule, valueBeforeValidation);
    if (result.error) {
      error = result.error;
      return;
    }

    const toSubmit = {
      ...valueBeforeValidation,
      ...result.value,
    };

    let inflight: ReturnType<typeof join>;
    if (kind === 'signup') {
      inflight = join(toSubmit);
    } else {
      inflight = signin(toSubmit);
    }
    inflight.then(onSuccessSignin, (err) => {
      if (err instanceof RequestError) {
        if (err.response?.status === 409) {
          setError('username', 'User already exists');
          return;
        } else if (err.response?.status === 401 || err.response?.status === 403) {
          // always show the vague password error
          setError('password', 'Sign in failed');
          return;
        } else if (err.response?.status === 400) {
          const errors: { field: 'username' | 'password'; message: string }[] = err.body?.errors || [];
          errors.forEach((e) => {
            setError(e.field, e.message);
          });
          if (errors.length > 0) return;
        }
      }
      console.log(kind + ' error', err);
    });
  };

  function setError(field: keyof typeof error, msg: string) {
    error = { username: '', password: '', ...{ [field]: msg } };
  }
</script>

<form onsubmit={onSubmit}>
  <Field name="Email" type="email" placeholder="hi@example.com" bind:value={username} error={error.username || ''} />
  <Field name="Password" type="password" placeholder="" bind:value={password} error={error.password || ''} />
  <div class="action">
    <Button type="submit">{kind === 'signup' ? 'Join' : 'Sign in'}</Button>
  </div>
</form>

<style lang="scss">
  .action {
    margin-top: 20px;
  }
</style>
