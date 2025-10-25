<script>
  let { children } = $props();
</script>

<div class="layout">
  <main>
    {@render children?.()}
  </main>
</div>

<style lang="scss">
  .layout {
    padding: 20px;
  }
  main {
    max-width: 600px;
    margin: 0 auto;
    padding: 15px;
    background-color: var(--bg-card);
    border-radius: 15px;
    --shadow-color: 0deg 0% 53%;
    // prettier-ignore
    --shadow-elevation-medium:
      0px 0.2px 0.2px hsl(var(--shadow-color) / 0.36),
      0px 0.7px 0.8px -0.8px hsl(var(--shadow-color) / 0.36),
      0px 1.7px 1.9px -1.7px hsl(var(--shadow-color) / 0.36),
      -0.1px 4.1px 4.6px -2.5px hsl(var(--shadow-color) / 0.36);
    @media (prefers-color-scheme: light) {
      box-shadow: var(--shadow-elevation-medium);
    }
  }
</style>
