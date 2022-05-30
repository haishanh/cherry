<script>
  export let href;
</script>

<a class="buttonish" {href}><slot /></a>

<style lang="scss">
  .buttonish {
    --fg: var(--color-text);
    --bg: var(--bg-btn);

    padding: 10px 14px;
    border-radius: 200px;
    text-decoration: none;
    cursor: pointer;
    user-select: none;
    display: inline-flex;
    align-items: center;

    color: var(--fg);
    background-color: var(--bg);
    border: 1px solid var(--color-btn-bo);

    @media (prefers-color-scheme: dark) {
      --bo-lightness: 30%;
      --bo-lightness-hover: 70%;
      --bg-hover: hsl(0deg 0% 19%);
    }
    @media (prefers-color-scheme: light) {
      --bo-lightness: 80%;
      --bo-lightness-hover: 15%;
      --bg-hover: hsl(0deg 0% 90%);
    }
    border-color: hsl(0deg 0% var(--bo-lightness));
    &:hover {
      border-color: hsl(0deg 0% var(--bo-lightness-hover));
      background-color: var(--bg-hover);
    }
  }
</style>
