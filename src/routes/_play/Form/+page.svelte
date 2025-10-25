<script lang="ts">
  import { commonRule, validate } from '$lib/client/form.util';
  import Button from '$lib/components/base/Button.svelte';
  import Field from '$lib/components/base/Field.svelte';

  const name = {
    f0: 'Email',
    f1: 'First Name',
    f2: 'Last Name',
  };
  const value = {
    f0: 'one',
    f1: 'f1',
    f2: 'f2',
  };
  const rule = {
    f0: [commonRule.email],
    f1: [],
    f2: [],
  };
  let error = $state({ f0: '', f1: '', f2: '' });

  function onSubmit(e: SubmitEvent) {
    e.preventDefault();
    const result = validate(rule, value);
    // @ts-ignore
    if (result.error) error = result.error;
  }
</script>

<main>
  <form onsubmit={onSubmit}>
    <Field name={name.f0} type="url" placeholder="https://example.com" bind:value={value.f0} error={error.f0} />
    <Field name={name.f1} bind:value={value.f1} error={error.f1} />
    <Field name={name.f2} bind:value={value.f2} />
    <div class="action">
      <Button type="submit">Save</Button>
    </div>
  </form>
</main>

<style lang="scss">
  main {
    max-width: 900px;
    margin: 0 auto;
    padding: 15px;
  }
</style>
