<script lang="ts">
  import Chip from '$lib/components/base/Chip.svelte';
</script>

<main>
  <section>
    <span class="chip orange">orange</span>
    <span class="chip yellow">yellow</span>
    <span class="chip success">success</span>
    <span class="chip warning">warning</span>
    <span class="chip info">info</span>
    <span class="chip error">error</span>
    <Chip modifier="error">error chip</Chip>
  </section>
  <section></section>
</main>

<style lang="scss">
  main {
    max-width: 900px;
    margin: 0 auto;
    padding: 15px;
  }

  section {
    margin: 16px 0;
    max-width: 600px;
    margin: 16px auto;
  }

  .chip {
    padding: 4px 9px;
    border-radius: 100px;
  }
  .chip.orange {
    color: hsl(31 100% 48%);
    background-color: hsl(35.48deg 94.9% 61.57% / 30%);
  }
  .chip.yellow {
    @media (prefers-color-scheme: light) {
      color: hsl(55.76deg 78.17% 26.98%);
    }
    @media (prefers-color-scheme: dark) {
      color: hsl(55.76deg 78.01% 84.18%);
    }
    background-color: hsl(49.65deg 100% 50% / 81%);
  }

  @media (prefers-color-scheme: light) {
    .info {
      --bg: hsl(208, 100%, 97%);
      --border: hsl(221, 91%, 91%);
      --text: hsl(210, 92%, 45%);
    }
    .success {
      --bg: hsl(143, 85%, 96%);
      --border: hsl(145, 92%, 91%);
      --text: hsl(140, 100%, 27%);
    }
    .error {
      --bg: hsl(359, 100%, 97%);
      --border: hsl(359, 100%, 94%);
      --text: hsl(360, 100%, 45%);
    }
    .warning {
      --bg: hsl(49, 100%, 97%);
      --border: hsl(49, 91%, 91%);
      --text: hsl(31, 92%, 45%);
    }
  }
  @media (prefers-color-scheme: dark) {
    .info {
      --bg: hsl(215, 100%, 6%);
      --border: hsl(223, 100%, 12%);
      --text: hsl(216, 87%, 65%);
    }
    .success {
      --bg: hsl(150, 100%, 6%);
      --border: hsl(147, 100%, 12%);
      --text: hsl(150, 86%, 65%);
    }
    .error {
      --bg: hsl(358, 76%, 10%);
      --border: hsl(357, 89%, 16%);
      --text: hsl(358, 100%, 81%);
    }
    .warning {
      --bg: hsl(64, 100%, 6%);
      --border: hsl(60, 100%, 12%);
      --text: hsl(46, 87%, 65%);
    }
  }

  .chip.success {
    color: var(--text);
    border: 1px solid var(--border);
    background-color: var(--bg);
  }
  .chip.warning {
    color: var(--text);
    border: 1px solid var(--border);
    background-color: var(--bg);
  }
  .chip.error {
    color: var(--text);
    border: 1px solid var(--border);
    background-color: var(--bg);
  }
  .chip.info {
    color: var(--text);
    border: 1px solid var(--border);
    background-color: var(--bg);
  }
</style>
