<script lang="ts">
  import { goto } from '$app/navigation';

  let searchText = '';

  function onSubmit() {
    const text = (searchText || '').trim();
    const url = `/search?q=${encodeURIComponent(text)}`;
    goto(url);
  }
</script>

<form on:submit|preventDefault={onSubmit}>
  <input type="text" placeholder="Type in something to search" bind:value={searchText} />
</form>

<style lang="scss">
  form {
    padding: 0 25px 25px;
    max-width: 800px;
    margin: 0 auto;
  }

  input {
    @media (prefers-color-scheme: dark) {
      --lightness: 7%;
    }
    @media (prefers-color-scheme: light) {
      --lightness: 75%;
    }
    -webkit-appearance: none;
    border-radius: 400px;
    border: 1px solid hsl(0deg 0% var(--lightness));
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    color: var(--color-text);
    font-size: inherit;
    height: 40px;
    outline: none;
    padding: 0 15px;
    -webkit-transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
    transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
    width: 100%;
  }

  input:hover {
    @media (prefers-color-scheme: dark) {
      --lightness: 30%;
    }
    @media (prefers-color-scheme: light) {
      --lightness: 50%;
    }
    border-color: hsl(0deg 0% var(--lightness));
  }

  input:focus {
    @media (prefers-color-scheme: dark) {
      --lightness: 70%;
    }
    @media (prefers-color-scheme: light) {
      --lightness: 15%;
    }
    border-color: hsl(0deg 0% var(--lightness));
  }
</style>
