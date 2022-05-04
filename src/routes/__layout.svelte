<script>
  import '../app.scss';
</script>

<slot />

<style lang="scss">
  :global(body, html) {
    margin: 0;
    padding: 0;
  }
  :global(button) {
    user-select: none;
  }
</style>
