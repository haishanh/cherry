<script lang="ts">
  import UserSignForm from '$lib/components/feature/UserSignForm.svelte';
</script>

<svelte:head>
  <title>Sign Up | Cherry</title>
</svelte:head>
<h1>Sign up</h1>
<UserSignForm kind="signup" />

<style lang="scss">
  h1 {
    margin-top: 0;
  }
</style>
